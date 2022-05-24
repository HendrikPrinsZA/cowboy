//usr/bin/env go run $0 $@; exit $?
package main

import (
	"fmt"
	"runtime"
)

func main() {
	var version = runtime.Version()
	fmt.Printf("GoLang (%s): Hello World!\n", version)
}
