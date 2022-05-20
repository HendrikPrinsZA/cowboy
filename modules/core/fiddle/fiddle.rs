#!/usr/bin/env run-cargo-script

const VERSION: Option<&str> = option_env!("CARGO_PKG_VERSION");

fn main() {
  println!("Rust (v{}): Hello World!", VERSION.unwrap_or("unknown"))
}
