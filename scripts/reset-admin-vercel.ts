import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { hashPassword } from "../src/server/security.server";
import { recoveryVariable } from "../src/server/admin-recovery.server";

// Only a salted hash is sent to the owner's Vercel project. Database secrets stay there.
let password = process.env["ADMIN_PASSWORD"];
delete process.env["ADMIN_PASSWORD"];
if (!password || password.length < 12 || password.length > 200)
  throw new Error("Zadejte nové heslo skrytě v PowerShellu (12–200 znaků).");
const project = {
  id: "prj_XgHaHyDQWT7Ngm09DihhhVDOa396",
  name: "reality-peta",
  scope: "witryxs-projects-00dfe443",
};
const origin = "https://www.petrpavlat-reality.cz";
const projectFiles = await readFile(".vercel/repo.json", "utf8").catch(() => "");
const legacyProject = await readFile(".vercel/project.json", "utf8").catch(() => "");
const repo = projectFiles ? JSON.parse(projectFiles) : undefined;
const legacy = legacyProject ? JSON.parse(legacyProject) : undefined;
if (
  !repo?.projects?.some((value: { id: string }) => value.id === project.id) &&
  legacy?.projectId !== project.id
)
  throw new Error(
    "Nejprve propojte tento adresář s existujícím projektem reality-peta pomocí vercel link.",
  );

class VercelCommandError extends Error {
  constructor(
    message: string,
    public deploymentUrl?: string,
  ) {
    super(message);
  }
}
async function vercel(args: string[], input?: string) {
  // Invoke the installed/cached official CLI through Node, so secrets never enter shell text.
  const executable = process.platform === "win32" ? "powershell.exe" : "npx";
  const parameters =
    process.platform === "win32"
      ? [
          "-NoProfile",
          "-NonInteractive",
          "-Command",
          "npx.cmd vercel " + args.map((arg) => "'" + arg.replace(/'/g, "''") + "'").join(" "),
        ]
      : ["vercel", ...args];
  return new Promise<string>((resolve, reject) => {
    const child = spawn(executable, parameters, {
      stdio: ["pipe", "pipe", "pipe"],
      windowsHide: true,
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve(stdout + "\n" + stderr);
      else
        reject(
          new VercelCommandError(
            `Vercel příkaz ${args.slice(0, 2).join(" ")} selhal. Ověřte přihlášení pomocí npx.cmd vercel whoami.`,
            args[0] === "redeploy"
              ? (stdout + "\n" + stderr).match(/https:\/\/[^\s]+\.vercel\.app/)?.[0]
              : undefined,
          ),
        );
    });
    child.stdin.end(input ?? "");
  });
}
const request = {
  id: randomUUID(),
  projectId: project.id,
  passwordHash: await hashPassword(password),
  expiresAt: Date.now() + 60 * 60 * 1000,
  ...(process.env["ADMIN_EMAIL"] ? { email: process.env["ADMIN_EMAIL"] } : {}),
};
console.log(
  "Předávám jednorázový požadavek na reset do produkčního projektu. Heslo zůstává v tomto terminálu.",
);
await vercel(
  [
    "env",
    "add",
    recoveryVariable,
    "production",
    "--type",
    "secret",
    "--force",
    "--yes",
    "--project",
    project.id,
    "--scope",
    project.scope,
  ],
  JSON.stringify(request),
);
try {
  console.log("Spouštím produkční nasazení. Může trvat několik minut…");
  try {
    await vercel(["redeploy", origin, "--target", "production", "--scope", project.scope]);
  } catch (error) {
    const deploymentUrl =
      error instanceof VercelCommandError ? (error.deploymentUrl ?? origin) : origin;
    const logs = await vercel(["inspect", deploymentUrl, "--logs", "--scope", project.scope]);
    const choices = logs.match(/Admin recovery accounts: (\[[^\r\n]+\])/);
    if (!choices) throw error;
    const emails = JSON.parse(choices[1]!) as string[];
    if (!emails.length || !process.stdin.isTTY)
      throw new Error(`Vyberte existující účet pomocí ADMIN_EMAIL. Účty: ${emails.join(", ")}`);
    console.log("V databázi je více admin účtů. Vyberte účet pro reset:");
    emails.forEach((email, index) => console.log(`${index + 1}. ${email}`));
    const input = createInterface({ input: process.stdin, output: process.stdout });
    let index: number;
    try {
      index = Number(await input.question("Číslo účtu: ")) - 1;
    } finally {
      input.close();
    }
    if (!Number.isInteger(index) || !emails[index])
      throw new Error("Neplatná volba účtu. Heslo se nezměnilo.");
    const selected = { ...request, id: randomUUID(), email: emails[index] };
    await vercel(
      [
        "env",
        "add",
        recoveryVariable,
        "production",
        "--type",
        "secret",
        "--force",
        "--yes",
        "--project",
        project.id,
        "--scope",
        project.scope,
      ],
      JSON.stringify(selected),
    );
    await vercel(["redeploy", origin, "--target", "production", "--scope", project.scope]);
  }
  // Confirm both the reset and the account email through the normal authenticated login.
  const logs = await vercel(["inspect", origin, "--logs", "--scope", project.scope]);
  const email =
    process.env["ADMIN_EMAIL"] || logs.match(/Admin recovery completed for ([^\s\x1b]+)/)?.[1];
  if (!email)
    throw new Error(
      "Nasazení skončilo, ale nepotvrdilo reset. Zkontrolujte jeho Build Logs ve Vercelu.",
    );
  const response = await fetch(`${origin}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok)
    throw new Error("Reset nelze potvrdit přihlášením. Zkontrolujte poslední nasazení ve Vercelu.");
  const session = response.headers.get("set-cookie")?.split(";")[0];
  if (session)
    await fetch(`${origin}/api/admin/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: origin, Cookie: session },
      body: "{}",
    });
  console.log(
    `Hotovo. E-mail: ${email}. Nové heslo je to, které jste zadali. Přihlášení bylo ověřeno na ${origin}/admin.`,
  );
} finally {
  password = undefined;
  await vercel([
    "env",
    "rm",
    recoveryVariable,
    "production",
    "--yes",
    "--project",
    project.id,
    "--scope",
    project.scope,
  ]).catch(() => {
    console.warn(
      "Dočasný požadavek zůstal ve Vercelu. Jednou provedený reset se díky auditu neopakuje.",
    );
  });
}
