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
  const token = await futureToken;

  const me = await tado.getMe();
  console.log(me);

  const [_, futureToken2] = await tado.authenticateWithToken(token);
  const token2 = await futureToken2;
  console.log("new token: ", token2);
  const me2 = await tado.getMe();
  console.log(me2);
}

main();
