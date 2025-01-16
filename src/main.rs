use minijinja::syntax::SyntaxConfig;
use minijinja::value::Object;
use minijinja::Value;
use minijinja::{context, Environment};
use serde_json5;
use std::fs;
use std::path::PathBuf;
use std::sync::Arc;

#[derive(Clone, Debug)]
struct Page {
    component: String,
    config: Value,
    directory_name: String,
    output_root: PathBuf,
    styles: String,
    template_path: PathBuf,
}

impl Page {
    pub fn new(directory_name: &str) -> Page {
        let source_root = PathBuf::from("content/pages").join(directory_name);
        let output_root = PathBuf::from("site/pages").join(directory_name);
        let config_string = fs::read_to_string(source_root.join("config.json5")).unwrap();
        Page {
            component: fs::read_to_string(source_root.join("component.js")).unwrap(),
            directory_name: directory_name.to_string(),
            output_root,
            config: serde_json5::from_str::<Value>(&config_string).unwrap(),
            template_path: source_root.join("template.html"),
            styles: fs::read_to_string(source_root.join("styles.css")).unwrap(),
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
