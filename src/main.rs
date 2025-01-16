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
    config: Value,
    template_path: PathBuf,
    output_path: PathBuf,
}

impl Page {
    pub fn new(dir_key: &str) -> Page {
        let source_dir = PathBuf::from("content/pages").join(dir_key);
        let config_path = source_dir.clone().join("config.json5");
        let template_path = source_dir.clone().join("template.html");
        let output_path = PathBuf::from("site/pages").join(dir_key).join("index.html");
        let json_string = fs::read_to_string(config_path).unwrap();
        let config = serde_json5::from_str::<Value>(&json_string).unwrap();

        Page {
            config,
            template_path,
            output_path,
        }
    }
}

impl Object for Page {
    fn get_value(self: &Arc<Self>, key: &Value) -> Option<Value> {
        match key.as_str()? {
            "config" => Some(self.config.clone()),
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
    fs::write(page.output_path, output).unwrap();

    println!("done");
}
