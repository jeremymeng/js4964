const { BlobServiceClient, SharedKeyCredential } = require("@azure/storage-blob");
const heapdump = require('heapdump');
const readline = require('readline');

async function main() {
  const accountName = process.env.ACCOUNT_NAME || "";
  const accountKey = process.env.ACCOUNT_KEY || "";

  const client = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    new SharedKeyCredential(accountName, accountKey)
  )

  const containerClient = client.getContainerClient("appendtestcontainer1");

  try {
    await containerClient.create();

  } catch (e) {
    if (!e.message.search("/already exists/g")) {
      throw e;

    }

  }


  const appendClient = containerClient.getAppendBlobClient("appendtestappendblob1");
  await appendClient.create();

  const content = "Hello World!";

  heapdump.writeSnapshot("before-appending");
  let i = 1000;
  while (i--) {
    if (i === 500 || i === 501) {
      console.log("Dumping heap...");
      //heapdump.writeSnapshot();
    }
    await appendClient.appendBlock(content, content.length);
    console.log(`block left: ${i}`);
  }

  await containerClient.delete();

  if (global.gc) {
    console.log("Forcing GC...");
    global.gc();
    heapdump.writeSnapshot("after-gc");
  }
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout

  });

  rl.question('Press any key to continue...', (answer) => {
    // TODO: Log the answer in a database
    rl.close();
  });
}

// An async method returns a Promise object, which is compatible with then().catch() coding style.
main()
  .then(() => {
    console.log("Successfully executed sample.");

  })
  .catch((err) => {
    console.log(err.message);

  });
