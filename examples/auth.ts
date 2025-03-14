import { Tado } from "../src";

async function main(): Promise<void> {
  const tado = new Tado();
  tado.setTokenCallback(console.log);

  const [verify, futureToken] = await tado.authenticate("refresh_token");

  if (verify) {
    console.log("------------------------------------------------");
    console.log("Device authentication required.");
    console.log("Please visit the following website in a browser.");
    console.log("");
    console.log(`  ${verify.verification_uri_complete}`);
    console.log("");
    console.log(
      `Checks will occur every ${verify.interval}s up to a maximum of ${verify.expires_in}s`,
    );
    console.log("------------------------------------------------");
  }
  await futureToken;

  const me = await tado.getMe();
  console.log(me);
}

main();
