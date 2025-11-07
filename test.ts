import { Tado } from "./src";

async function main(): Promise<void> {
  const tado = new Tado();
  tado.setTokenCallback((token) => {
    console.log(`Token: ${token.refresh_token}`);
  });

  const [verify, futureToken] = await tado.authenticate(
    "H8rQv0TF08jYPVk5PC_7uKAnkLKcB5UVoUM4k-_FTH3n962PxL1YYoyXyK3hUIj7",
  );
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

  setInterval(() => {
    tado
      .getMe()
      .then((me) => {
        console.log(me.username);
        console.log(tado.getRatelimit());
      })
      .catch((err) => {
        console.log(`Err: ${err}`);
      });
  }, 5000);
}

main();
