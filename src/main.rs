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
}

impl Page {
    pub fn new(dir_key: &str) -> Page {
        let source_dir = PathBuf::from("content/pages").join(dir_key);
        let output_root = PathBuf::from("site/pages").join(dir_key);
        let config_string = fs::read_to_string(source_dir.clone().join("config.json5")).unwrap();

        let component_output_path = output_root.clone().join("component.js");
        let component_path = source_dir.clone().join("component.js");
        let component = fs::read_to_string(component_path).unwrap();
        let styles = fs::read_to_string(source_dir.clone().join("styles.css")).unwrap();
        Page {
            component,
            component_output_path,
            html_output_path: output_root.join("index.html"),
            config: serde_json5::from_str::<Value>(&config_string).unwrap(),
            template_path: source_dir.clone().join("template.html"),
            styles,
            styles_output_path: output_root.clone().join("styles.css"),
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
