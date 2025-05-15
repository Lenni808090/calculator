
mod calculator;

use calculator::lexer::{Lexer};
use calculator::parser::{Parser};


#[tauri::command]
fn parse_expression(input: &str) -> String {
    let chars: Vec<char> = input.chars().collect();
    let mut lexer = Lexer::new(chars);
    let tokens = lexer.tokenize();
    let mut parser = Parser::new(tokens);
    let ast = parser.parse();
    format!("{:#?}", ast)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![parse_expression])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
