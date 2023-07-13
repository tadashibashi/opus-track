import {exec} from "child_process";
import {parseArgs} from "./cmdline";



const scripts = {
    build() {
        exec("yarn build")
    }
};

const args = parseArgs();

const buildTask = args.flags["t"] || "build";


