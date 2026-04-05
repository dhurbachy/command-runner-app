// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::process::Command;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}
#[tauri::command]
fn run_shell_command(cmd:String)->String{
    let output=if cfg!(target_os="windows"){
        Command::new("cmd").args(["/C",&cmd]).output()

    }else{
     Command::new("sh").args(["-c",&cmd]).output()
    };

    match output {
        Ok(out) => String::from_utf8_lossy(&out.stdout).to_string(),
        Err(e) => format!("Error: {}", e),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet,run_shell_command])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
