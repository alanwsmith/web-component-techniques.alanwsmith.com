use minijinja::syntax::SyntaxConfig;
use minijinja::value::Object;
use minijinja::Value;
use minijinja::{context, Environment};
use serde_json5;
use std::collections::BTreeMap;
use std::fs;
use std::path::PathBuf;
use std::sync::Arc;

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
        let source_root = PathBuf::from("content/pages").join(directory_name);
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
}

impl Object for Page {
    fn get_value(self: &Arc<Self>, key: &Value) -> Option<Value> {
        match key.as_str()? {
            "config" => Some(self.config.clone()),
            "directory_name" => Some(Value::from(self.directory_name.clone())),
            _ => None,
        }
    }
}

fn main() {
    generate_page("handling-styles");
    println!("done");
}

fn generate_page(dir_key: &str) {
    let page = Page::new(dir_key);
    dbg!(&page.snippets);
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
