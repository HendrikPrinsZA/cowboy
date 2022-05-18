#!/usr/bin/env bash

# - ref: https://stackoverflow.com/a/246128/7403334
SOURCE=${BASH_SOURCE[0]}
while [ -h "$SOURCE" ]; do
  DIR=$( cd -P "$( dirname "$SOURCE" )" >/dev/null 2>&1 && pwd )
  SOURCE=$(readlink "$SOURCE")
  [[ $SOURCE != /* ]] && SOURCE=$DIR/$SOURCE
done
SCRIPT_DIR=$( cd -P "$( dirname "$SOURCE" )" >/dev/null 2>&1 && pwd )
MODULES_DIR=$( cd -P "$( dirname "$SOURCE" )/../.." >/dev/null 2>&1 && pwd )

# Log silently
$(cowboy log --log-name core-open $@)

launchVsc () {
  local path=$1
  
  local commonEditors=(
    "code"
    "/usr/local/bin/code",
    "/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code"
  )

  for cmd in "${commonEditors[@]}"
  do
    if ! command -v $cmd &> /dev/null
    then
      # verbose
      echo "${cmd} could not be found"
      continue
    fi

    $cmd $path
    if [ $? -eq 0 ]; then
      exit 0
    fi
  done
}

# Argument 1 is expected as the command (not req)
COMMAND=$1

# Open modules/local/$command first
commandPath="${MODULES_DIR}/local/${COMMAND}"
if [ -d $commandPath ]; then
  launchVsc $commandPath
  exit 0
fi

# Open modules/public/$command second
commandPath="${MODULES_DIR}/public/${COMMAND}"
if [ -d $commandPath ]; then
  launchVsc $commandPath
  exit 0
fi

# Open modules/core/$command second
commandPath="${MODULES_DIR}/core/${COMMAND}"
if [ -d $commandPath ]; then
  launchVsc $commandPath
  exit 0
fi
