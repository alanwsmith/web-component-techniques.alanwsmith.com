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
    template_path: PathBuf,
}

impl Page {
    pub fn new(dir_key: &str) -> Page {
        let output_root = PathBuf::from("site/pages").join(dir_key);
        let source_dir = PathBuf::from("content/pages").join(dir_key);
        let config_path = source_dir.clone().join("config.json5");
        let template_path = source_dir.clone().join("template.html");
        let html_output_path = PathBuf::from("site/pages").join(dir_key).join("index.html");
        let component_output_path = output_root.clone().join("component.js");
        let component_path = source_dir.clone().join("component.js");
        let component = fs::read_to_string(component_path).unwrap();
        let json_string = fs::read_to_string(config_path).unwrap();
        let config = serde_json5::from_str::<Value>(&json_string).unwrap();
        Page {
            component,
            component_output_path,
            html_output_path,
            config,
            template_path,
        }
    }
}

impl Object for Page {
    fn get_value(self: &Arc<Self>, key: &Value) -> Option<Value> {
        match key.as_str()? {
            "config" => Some(self.config.clone()),
            // "component" => Some(Value::from(self.component.clone())),
            _ => None,
        }
    }
}

fn main() {
    let page = Page::new("handling-styles");
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
    println!("done");
}
