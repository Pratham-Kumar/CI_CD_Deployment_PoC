const cds = require("@sap/cds");
const simpleGit = require("simple-git");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs-extra");

module.exports = cds.service.impl(function () {

    this.on("deployApplication", async (req) => {
        const data = req.data;

        setImmediate(async () => {
            await deployLogic(data);
        });

        return "Deployment started in background";
    });

});

async function deployLogic(data) {
    const {
        repoUrl,
        branch,
        cfApi,
        cfUser,
        cfPassword,
        cfOrg,
        cfSpace
    } = data;

    const projectPath = path.join(__dirname, "../tmp", Date.now().toString());

    try {
        await fs.ensureDir(projectPath);

        const git = simpleGit();

        console.log("Cloning repository...");
        await git.clone(repoUrl, projectPath, ["-b", branch]);

        console.log("Installing dependencies...");
        await runCommand("npm install --production", projectPath);

        console.log("Installing UI5 CLI locally...");
        await runCommand("npm install @ui5/cli --no-save", projectPath);

        console.log("Fixing PATH...");
        process.env.PATH = `${projectPath}/node_modules/.bin:` + process.env.PATH;

        console.log("Verifying UI5...");
        await runCommand("ui5 --version", projectPath);

        console.log("Building MTA...");
        await runCommand("npx mbt build -p cf", projectPath);

        console.log("Logging into CF...");
        await runCommand(
            `cf login -a ${cfApi} -u ${cfUser} -p ${cfPassword} -o ${cfOrg} -s ${cfSpace}`,
            projectPath
        );

        try {
            await runCommand("cf plugins", projectPath);
        } catch {
            await runCommand("cf install-plugin multiapps -f", projectPath);
        }

        const mtarPath = await getMtarFile(projectPath);

        console.log("Deploying MTAR...");
        await runCommand(`cf deploy "${mtarPath}" -f`, projectPath);

        console.log("Deployment successful");

    } catch (error) {
        console.error("Deployment failed:", error.message);
    } finally {
        await fs.remove(projectPath);
    }
}

function runCommand(command, cwd) {
    return new Promise((resolve, reject) => {
        exec(command, { cwd, maxBuffer: 1024 * 1024 * 10, env: process.env }, (error, stdout, stderr) => {
            if (error) {
                console.error(stderr);
                return reject(error);
            }
            console.log(stdout);
            resolve(stdout);
        });
    });
}

async function getMtarFile(projectPath) {
    const mtaDir = path.join(projectPath, "mta_archives");

    if (!await fs.pathExists(mtaDir)) {
        throw new Error("mta_archives folder not found");
    }

    const files = await fs.readdir(mtaDir);
    const mtarFile = files.find(f => f.endsWith(".mtar"));

    if (!mtarFile) {
        throw new Error("MTAR file not found");
    }

    return path.join(mtaDir, mtarFile);
}