const { Aborter, AppendBlobURL, BlobURL, ServiceURL, StorageURL, ContainerURL, SharedKeyCredential } = require("@azure/storage-blob");
const heapdump = require('heapdump');

async function main() {
  const accountName = process.env.ACCOUNT_NAME || "";
  const accountKey = process.env.ACCOUNT_KEY || "";

  const sharedKeyCredential = new SharedKeyCredential(accountName, accountKey);

  // Use sharedKeyCredential, tokenCredential or anonymousCredential to create a pipeline
  const pipeline = StorageURL.newPipeline(sharedKeyCredential);
  console.log(pipeline);
  const serviceURL = new ServiceURL(
    `https://${accountName}.blob.core.windows.net`,
    pipeline
  );

  const containerName = "appendtestcontainer1";
  const containerURL = ContainerURL.fromServiceURL(serviceURL, containerName);

  try {
    await containerURL.create(Aborter.none);

  } catch (e) {
    if (!e.message.search("/already exists/g")) {
      throw e;

    }

  }

  const blobName = "appendtestappendblob1";
  const blobURL = BlobURL.fromContainerURL(containerURL, blobName);
  const appendClient = AppendBlobURL.fromBlobURL(blobURL);
  await appendClient.create(Aborter.none);

  const content = "Hello World!";

  let i = 1000;
  while (i--) {
    if (i % 100 === 0) {
      console.log("Dumping heap...");
      heapdump.writeSnapshot();
    }
    await appendClient.appendBlock(Aborter.none, content, content.length);
    console.log(`block left: ${i}`);

  }

  await containerURL.delete(Aborter.none);

}

// An async method returns a Promise object, which is compatible with then().catch() coding style.
main()
  .then(() => {
    console.log("Successfully executed sample.");

  })
  .catch((err) => {
    console.log(err.message);

  });
