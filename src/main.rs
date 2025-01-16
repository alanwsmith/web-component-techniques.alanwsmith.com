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
    component_output_path: PathBuf,
    config: Value,
    html_output_path: PathBuf,
    styles: String,
    styles_output_path: PathBuf,
    template_path: PathBuf,
    directory_name: String,
}

impl Page {
    pub fn new(directory_name: &str) -> Page {
        let source_root = PathBuf::from("content/pages").join(directory_name);
        let output_root = PathBuf::from("site/pages").join(directory_name);
        let config_string = fs::read_to_string(source_root.join("config.json5")).unwrap();
        Page {
            component: fs::read_to_string(source_root.join("component.js")).unwrap(),
            component_output_path: output_root.join("component.js"),
            directory_name: directory_name.to_string(),
            html_output_path: output_root.join("index.html"),
            config: serde_json5::from_str::<Value>(&config_string).unwrap(),
            template_path: source_root.join("template.html"),
            styles: fs::read_to_string(source_root.join("styles.css")).unwrap(),
            styles_output_path: output_root.clone().join("styles.css"),
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
    fs::write(page.html_output_path, output).unwrap();
    fs::write(page.component_output_path, page.component).unwrap();
}
