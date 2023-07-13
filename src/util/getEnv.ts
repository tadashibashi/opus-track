import dotenv from "dotenv";
dotenv.config();

/**
 * Gets environment variable as a string. Throws ReferenceError if not found.
 * Add second parameter of `false` to allow undefined returns when not found.
 * @param varName  - name of the env variable
 */
export function getEnv(varName: string): string;
/**
 * Gets environment variable as a string. Returns undefined if not found.
 * @param varName  - name of the env variable
 * @param required - throws ReferenceError when true if var not found, on false, it will return undefined.
 */
export function getEnv(varName: string, required: true): string;
/**
 * Gets environment variable as a string. Returns undefined if not found.
 * @param varName  - name of the env variable
 * @param required - throws ReferenceError when true if var not found, on false, it will return undefined.
 */
export function getEnv(varName: string, required: false): string | undefined;
export function getEnv(varName: string, required: boolean = true): string | undefined {
    const variable = process.env[varName];

    if (required && variable === undefined) {
        throw ReferenceError("Variable \"" + varName + "\" is not defined in environment.");
    }

    return variable;
}

export default getEnv;
