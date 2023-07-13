import NodeClam from "clamscan";
import {Readable} from "stream";

let scanner: NodeClam | null = null;

/**
 * Initialize connection to local anti-virus service.
 */
export async function config(debugMode = false) {
    return new Promise((resolve, reject) => {
        new NodeClam().init({
            removeInfected: true,
            quarantineInfected: false,
            debugMode: false,
            clamscan: {
                path: '/opt/homebrew/bin/clamscan', // Path to clamscan binary on your server
                //db: null, // Path to a custom virus definition database
                scanArchives: true, // If true, scan archives (ex. zip, rar, tar, dmg, iso, etc...)
                active: true // If true, this module will consider using the clamscan binary
            },
            clamdscan: {
                path: "/opt/homebrew/bin/clamdscan",
                active: true,
                host: "localhost",
                port: 3310,
                timeout: 60000,
                multiscan: true,
                socket: false,
                localFallback: true,
            },
            preference: "clamdscan"


        }, (err, clam) => {
            scanner = clam;
            if (!clam) {
                console.error("Failed to initialize clamd", err);
                reject(err);
            } else {
                resolve(true);
            }
        });
    });
}


interface ScanResult {
    file: string;
    isInfected: boolean;
    viruses: string [];
}


/**
 * Check for infected files at provided `filepaths`, and delete them if necessary
 * @param filepaths list of file paths to check
 * @return a list of file results. Please check `ifInfected` member var in each result.
 */
export async function scanFiles(filepaths: string[]): Promise<ScanResult[]> {
    if (scanner === null) {
        throw ReferenceError("[util.scanFile]: tried to use NodeClam before it has been initialized");
    }

    const promises: Promise<ScanResult>[] = [];
    filepaths.forEach(path => promises.push(scanner!.scanFile(path)));

    return await Promise.all(promises);
}


/**
 * Check for infected file
 * @param bufferOrPath
 */
export async function scanFile(bufferOrPath: Buffer | string): Promise<NodeClam.Response<{file: string, isInfected: boolean}>> {
    if (!scanner) {
        throw ReferenceError("[util.scanFile]: tried to use NodeClam before it has been initialized");
    }

    if (typeof bufferOrPath === "string") {
        try {
            return await scanner.scanFile(bufferOrPath);
        } catch(e) {
            if (e instanceof Error)
                console.log("[util.scanFile]: problem while scanning file:", e.message);
            throw e;
        }

    } else {
        try {
            const stream = Readable.from(bufferOrPath);
            return await scanner.scanStream(stream);
        } catch(e) {
            if (e instanceof Error)
                console.error("[util.scanFile]: problem while scanning file:", e.message);
            throw e;
        }
    }
}

export default {
    config,
    scanFile,
    scanFiles,
}
