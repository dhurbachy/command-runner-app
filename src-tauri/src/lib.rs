// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::process::Command;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}
#[tauri::command]
fn run_shell_command(cmd:String)->String{
    let process=if cfg!(target_os="windows"){
        Command::new("cmd").args(["/C",&cmd]).spawn()

    }else{
     Command::new("sh").args(["-c",&cmd]).spawn()
    };

    match process {
        Ok(_) => "Process started successfully.".to_string(),
        Err(e) => format!("Failed to start process: {}", e),
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
