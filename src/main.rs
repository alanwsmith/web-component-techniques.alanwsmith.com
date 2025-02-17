use minijinja::syntax::SyntaxConfig;
use minijinja::value::Object;
use minijinja::Value;
use minijinja::{context, Environment, Error};
use serde_json5;
use std::collections::BTreeMap;
use std::fs;
use std::path::PathBuf;
use std::sync::Arc;
use syntect::html::{ClassStyle, ClassedHTMLGenerator};
use syntect::parsing::SyntaxSet;
use syntect::util::LinesWithEndings;

#[derive(Clone, Debug)]
struct Page {
    component: String,
    config: Value,
    directory_name: String,
    output_root: PathBuf,
    snippets: BTreeMap<String, String>,
    styles: String,
    template_path: PathBuf,
}

impl Page {
    fn new(directory_name: &str) -> Page {
        let source_root = PathBuf::from("source/pages").join(directory_name);
        let output_root = PathBuf::from("site/pages").join(directory_name);
        let config_string = fs::read_to_string(source_root.join("config.json5")).unwrap();
        Page {
            component: fs::read_to_string(source_root.join("component.js")).unwrap(),
            config: serde_json5::from_str::<Value>(&config_string).unwrap(),
            directory_name: directory_name.to_string(),
            output_root,
            snippets: get_snippets(source_root.join("snippets")),
            styles: fs::read_to_string(source_root.join("styles.css")).unwrap(),
            template_path: source_root.join("template.html"),
        }
    }

    fn display_snippet(&self, args: &[Value]) -> Result<Value, Error> {
        let snippet_file_name = args[0].to_string();
        let snippet_content = self.snippets.get(&snippet_file_name).unwrap();
        let highlighted_snippet = highlight_code(&snippet_content, "html");
        Ok(Value::from(format!(
            r#"
<div class="example-block flow">
    <h4>Code</h4>
    <pre><code>{}</code></pre>
    <h4>Result</h4>
    <div class="example-output">{}</div>
</div>
        "#,
            highlighted_snippet, snippet_content
        )))
    }

    fn display_snippet_without_result(&self, args: &[Value]) -> Result<Value, Error> {
        let snippet_file_name = args[0].to_string();
        let snippet_content = self.snippets.get(&snippet_file_name).unwrap();
        let highlighted_snippet = highlight_code(&snippet_content, "html");
        Ok(Value::from(format!(
            r#"
<div class="example-block flow">
    <h4>Code</h4>
    <pre><code>{}</code></pre>
</div>
        "#,
            highlighted_snippet
        )))
    }

    fn highlighted_styles(&self, _args: &[Value]) -> Result<Value, Error> {
        let highlighted_code = highlight_code(&self.styles, "css");
        Ok(Value::from(highlighted_code))
    }

    fn highlighted_snippet(&self, args: &[Value]) -> Result<Value, Error> {
        let highlighted_code =
            highlight_code(self.snippets.get(&args[0].to_string()).unwrap(), "html");
        Ok(Value::from(highlighted_code))
    }

    fn highlighted_component(&self, args: &[Value]) -> Result<Value, Error> {
        let highlighted_code = highlight_code(&self.component, "js");
        if args.len() == 2 {
            let lines = highlighted_code.lines();
            let start: usize = args[0].to_string().parse().unwrap();
            let end: usize = args[1].to_string().parse().unwrap();
            let selects: Vec<String> = lines
                .into_iter()
                .skip(start - 1)
                .take(end - start + 1)
                .map(|x| x.to_string())
                .collect();
            Ok(Value::from(selects.join("\n")))
        } else {
            Ok(Value::from(highlighted_code))
        }
    }

    fn snippet(&self, args: &[Value]) -> Result<Value, Error> {
        Ok(Value::from(self.snippets.get(&args[0].to_string())))
    }
}

impl Object for Page {
    fn get_value(self: &Arc<Self>, key: &Value) -> Option<Value> {
        match key.as_str()? {
            "config" => Some(self.config.clone()),
            "directory_name" => Some(Value::from(self.directory_name.clone())),
            _ => None,
        }
    }

    fn call_method(
        self: &Arc<Page>,
        _state: &minijinja::State,
        name: &str,
        args: &[Value],
    ) -> Result<Value, Error> {
        match name {
            "display_snippet" => self.display_snippet(args),
            "display_snippet_without_result" => self.display_snippet_without_result(args),
            "highlighted_component" => self.highlighted_component(args),
            "highlighted_snippet" => self.highlighted_snippet(args),
            "highlighted_styles" => self.highlighted_styles(args),
            "snippet" => self.snippet(args),
            _ => Ok(Value::from("")),
        }
    }
}

fn main() {
    let dirs = get_dirs_in_dir(&PathBuf::from("source/pages")).unwrap();
    dirs.iter().for_each(|dir| {
        let dir_name = dir.file_name().unwrap().to_string_lossy().to_string();
        generate_page(&dir_name);
    });
    println!("done");
}

fn generate_page(dir_key: &str) {
    let page = Page::new(dir_key);
    let page_obj = Value::from_object(page.clone());
    let mut env = Environment::new();
    env.set_syntax(
        SyntaxConfig::builder()
            .block_delimiters("[!", "!]")
            .variable_delimiters("[@", "@]")
            .comment_delimiters("[#", "#]")
            .build()
            .unwrap(),
    );
    // Wrapper:
    let wrapper_string = fs::read_to_string("source/wrappers/main-wrapper.html").unwrap();
    env.add_template("wrappers/main-wrapper.html", &wrapper_string)
        .unwrap();
    let template_string = fs::read_to_string(page.template_path.clone()).unwrap();
    env.add_template("main-template", &template_string).unwrap();
    let tmpl = env.get_template("main-template").unwrap();
    let output = tmpl.render(context!(page => page_obj)).unwrap();
    fs::write(page.output_root.join("index.html"), output).unwrap();
    fs::write(page.output_root.join("component.js"), page.component).unwrap();
    fs::write(page.output_root.join("styles.css"), page.styles).unwrap();
}

fn get_snippets(dir: PathBuf) -> BTreeMap<String, String> {
    let mut snippets = BTreeMap::new();
    let file_list: Vec<PathBuf> = fs::read_dir(dir)
        .unwrap()
        .into_iter()
        .filter(|p| {
            if p.as_ref().unwrap().path().is_file() {
                true
            } else {
                false
            }
        })
        .filter_map(|p| match p.as_ref().unwrap().path().strip_prefix(".") {
            Ok(_) => None,
            Err(_) => Some(p.as_ref().unwrap().path()),
        })
        .collect();
    file_list.iter().for_each(|p| {
        snippets.insert(
            p.file_name().unwrap().to_string_lossy().to_string(),
            fs::read_to_string(p).unwrap().trim_end().to_string(),
        );
    });
    snippets
}

fn highlight_code(code: &str, lang: &str) -> String {
    let syntax_set = SyntaxSet::load_defaults_newlines();
    let syntax = syntax_set
        .find_syntax_by_token(&lang)
        .unwrap_or_else(|| syntax_set.find_syntax_plain_text());
    let mut html_generator =
        ClassedHTMLGenerator::new_with_class_style(syntax, &syntax_set, ClassStyle::Spaced);
    for line in LinesWithEndings::from(code) {
        let _ = html_generator.parse_html_for_line_which_includes_newline(line);
    }
    let initial_html = html_generator.finalize();
    let output_html: Vec<_> = initial_html
        .lines()
        .map(|line| format!(r#"<span class="line-marker"></span>{}"#, line))
        .collect();
    output_html.join("\n")
}

fn get_dirs_in_dir(source_dir: &PathBuf) -> Result<Vec<PathBuf>, std::io::Error> {
    Ok(fs::read_dir(source_dir)?
        .into_iter()
        .filter_map(|entry| match entry {
            Ok(item) => Some(item),
            Err(_) => None,
        })
        .filter_map(|item| {
            if item.path().is_dir() {
                Some(item.path())
            } else {
                None
            }
        })
        .filter(|item| match item.file_name() {
            Some(fname) => {
                !fname.to_string_lossy().starts_with("$")
                    && !fname.to_string_lossy().starts_with(".")
            }
            None => false,
        })
        .collect::<Vec<_>>())
}
