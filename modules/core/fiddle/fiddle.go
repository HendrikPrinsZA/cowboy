package main

import (
	"fmt"
	"runtime"
)

func main() {
	var version = runtime.Version()
	fmt.Printf("GoLang (%s): Hello World!\n", version)
}
