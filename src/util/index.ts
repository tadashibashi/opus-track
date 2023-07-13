
export function getEnvironmentVar(varName: string): string {
    const variable = process.env[varName];

    if (variable === undefined) {
        throw ReferenceError("Variable \"" + varName + "\" is not defined in environment.");
    }

    return variable;
}

// TODO: expressPerformance that creates middleware for testing time
