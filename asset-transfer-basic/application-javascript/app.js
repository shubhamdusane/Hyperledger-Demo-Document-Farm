// /*
//  * Copyright IBM Corp. All Rights Reserved.
//  *
//  * SPDX-License-Identifier: Apache-2.0
//  */

// 'use strict';

// const { Gateway, Wallets } = require('fabric-network');
// const FabricCAServices = require('fabric-ca-client');
// const path = require('path');
// const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../../test-application/javascript/CAUtil.js');
// const { buildCCPOrg1, buildWallet } = require('../../test-application/javascript/AppUtil.js');

// const channelName = process.env.CHANNEL_NAME || 'mychannel';
// const chaincodeName = process.env.CHAINCODE_NAME || 'basic';

// const mspOrg1 = 'Org1MSP';
// const walletPath = path.join(__dirname, 'wallet');
// const org1UserId = 'javascriptAppUser';

// function prettyJSONString(inputString) {
// 	return JSON.stringify(JSON.parse(inputString), null, 2);
// }

// // pre-requisites:
// // - fabric-sample two organization test-network setup with two peers, ordering service,
// //   and 2 certificate authorities
// //         ===> from directory /fabric-samples/test-network
// //         ./network.sh up createChannel -ca
// // - Use any of the asset-transfer-basic chaincodes deployed on the channel "mychannel"
// //   with the chaincode name of "basic". The following deploy command will package,
// //   install, approve, and commit the javascript chaincode, all the actions it takes
// //   to deploy a chaincode to a channel.
// //         ===> from directory /fabric-samples/test-network
// //         ./network.sh deployCC -ccn basic -ccp ../asset-transfer-basic/chaincode-javascript/ -ccl javascript
// // - Be sure that node.js is installed
// //         ===> from directory /fabric-samples/asset-transfer-basic/application-javascript
// //         node -v
// // - npm installed code dependencies
// //         ===> from directory /fabric-samples/asset-transfer-basic/application-javascript
// //         npm install
// // - to run this test application
// //         ===> from directory /fabric-samples/asset-transfer-basic/application-javascript
// //         node app.js

// // NOTE: If you see  kind an error like these:
// /*
//     2020-08-07T20:23:17.590Z - error: [DiscoveryService]: send[mychannel] - Channel:mychannel received discovery error:access denied
//     ******** FAILED to run the application: Error: DiscoveryService: mychannel error: access denied

//    OR

//    Failed to register user : Error: fabric-ca request register failed with errors [[ { code: 20, message: 'Authentication failure' } ]]
//    ******** FAILED to run the application: Error: Identity not found in wallet: appUser
// */
// // Delete the /fabric-samples/asset-transfer-basic/application-javascript/wallet directory
// // and retry this application.
// //
// // The certificate authority must have been restarted and the saved certificates for the
// // admin and application user are not valid. Deleting the wallet store will force these to be reset
// // with the new certificate authority.
// //

// /**
//  *  A test application to show basic queries operations with any of the asset-transfer-basic chaincodes
//  *   -- How to submit a transaction
//  *   -- How to query and check the results
//  *
//  * To see the SDK workings, try setting the logging to show on the console before running
//  *        export HFC_LOGGING='{"debug":"console"}'
//  */
// async function main() {
// 	try {
// 		// build an in memory object with the network configuration (also known as a connection profile)
// 		const ccp = buildCCPOrg1();

// 		// build an instance of the fabric ca services client based on
// 		// the information in the network configuration
// 		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');

// 		// setup the wallet to hold the credentials of the application user
// 		const wallet = await buildWallet(Wallets, walletPath);

// 		// in a real application this would be done on an administrative flow, and only once
// 		await enrollAdmin(caClient, wallet, mspOrg1);

// 		// in a real application this would be done only when a new user was required to be added
// 		// and would be part of an administrative flow
// 		await registerAndEnrollUser(caClient, wallet, mspOrg1, org1UserId, 'org1.department1');

// 		// Create a new gateway instance for interacting with the fabric network.
// 		// In a real application this would be done as the backend server session is setup for
// 		// a user that has been verified.
// 		const gateway = new Gateway();

// 		try {
// 			// setup the gateway instance
// 			// The user will now be able to create connections to the fabric network and be able to
// 			// submit transactions and query. All transactions submitted by this gateway will be
// 			// signed by this user using the credentials stored in the wallet.
// 			await gateway.connect(ccp, {
// 				wallet,
// 				identity: org1UserId,
// 				discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
// 			});
// 		}
// 			// Build a network instance based on the channel where the smart contract is deployed
// 			const network = await gateway.getNetwork(channelName);

// 			// Get the contract from the network.
// 			const contract = network.getContract(chaincodeName);

// 			// Initialize a set of asset data on the channel using the chaincode 'InitLedger' function.
// // 			// This type of transaction would only be run once by an application the first time it was started after it
// // 			// deployed the first time. Any updates to the chaincode deployed later would likely not need to run
// // 			// an "init" type function.
// // 			console.log('\n--> Submit Transaction: InitLedger, function creates the initial set of assets on the ledger');
// // 			await contract.submitTransaction('InitLedger');
// // 			console.log('*** Result: committed');

// // 			// Let's try a query type operation (function).
// // 			// This will be sent to just one peer and the results will be shown.
// // 			console.log('\n--> Evaluate Transaction: GetAllAssets, function returns all the current assets on the ledger');
// // 			let result = await contract.evaluateTransaction('GetAllAssets');
// // 			console.log(`*** Result: ${prettyJSONString(result.toString())}`);

// // 						// Now let's try to submit a transaction.
// // 			// This will be sent to both peers and if both peers endorse the transaction, the endorsed proposal will be sent
// // 			// to the orderer to be committed by each of the peer's to the channel ledger.
// // 			console.log('\n--> Submit Transaction: pushDocumentUpload, creates new asset with DocumentID, owner arguments');
// // 			result = await contract.submitTransaction('pushDocumentUpload', '5', 'Shubhamdusane', '2023-09-15T10:00:00Z');
// // 			console.log('*** Result: committed');
// // 			if (`${result}` !== '') {
// // 				console.log(`*** Result: ${prettyJSONString(result.toString())}`);
// // 			}

// // /*		  
// // 			const payment = {amount: 100, date: '2023-02-15T12:00:00Z'};
// // 			await contract.submitTransaction('pushPaymentTransaction', 5, payment);
// // 		    result = await contract.evaluateTransaction('pullDocumentUploadTransactions', Shubhamdusane);
// // 			console.log(JSON.parse(result.toString()));
		  
// // 			result = await contract.evaluateTransaction('pullPaymentsForDocument', 5);
// // 			console.log(JSON.parse(result.toString()));
// // */		  
// // 			result = await contract.evaluateTransaction('getContributorResults', Shubhamdusane);
// // 			console.log(JSON.parse(result.toString()));

// // 			console.log('\n--> Evaluate Transaction: ReadAsset, function returns an asset with a given assetID');
// // 			result = await contract.evaluateTransaction('ReadAsset', 'asset313');
// // 			console.log(`*** Result: ${prettyJSONString(result.toString())}`);

// // 			console.log('\n--> Evaluate Transaction: AssetExists, function returns "true" if an asset with given assetID exist');
// // 			result = await contract.evaluateTransaction('AssetExists', 'asset1');
// // 			console.log(`*** Result: ${prettyJSONString(result.toString())}`);

// // 			console.log('\n--> Evaluate Transaction: ReadAsset, function returns "asset1" attributes');
// // 			result = await contract.evaluateTransaction('ReadAsset', 'asset1');
// // 			console.log(`*** Result: ${prettyJSONString(result.toString())}`);
// // 		}
			
// // 			finally {
// // 			// Disconnect from the gateway when the application is closing
// // 			// This will close all connections to the network
// // 			gateway.disconnect();
// // 		}
// // 	} catch (error) {
// // 		console.error(`******** FAILED to run the application: ${error}`);
// // 		process.exit(1);
// // 	}
// // }


// main();



'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 6000;
const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const cors = require('cors'); 
// Enable CORS for all routes
app.use(cors());

// Import necessary functions from CAUtil.js and AppUtil.js
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../../test-application/javascript/CAUtil.js');
const { buildCCPOrg1, buildWallet } = require('../../test-application/javascript/AppUtil.js');

const path = require('path');

const channelName = 'mychannel';
const chaincodeName = 'basic';

const mspOrg1 = 'Org1MSP';
const walletPath = path.join(__dirname, 'wallet');
const org1UserId = 'javascriptAppUser';

// Middleware to parse incoming JSON data
app.use(bodyParser.json());

async function connectToNetwork() {
  const ccp = buildCCPOrg1();
  const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');
  const wallet = await buildWallet(Wallets, walletPath);

  await enrollAdmin(caClient, wallet, mspOrg1);
  await registerAndEnrollUser(caClient, wallet, mspOrg1, org1UserId, 'org1.department1');

  const gateway = new Gateway();

  try {
    await gateway.connect(ccp, {
      wallet,
      identity: org1UserId,
      discovery: { enabled: true, asLocalhost: true }
    });

    const network = await gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);

    return contract;
  } catch (error) {
    console.error('Failed to connect to the network:', error);
    throw error;
  }
}

app.post('/api/initLedger', async (req, res) => {
	const contract = await connectToNetwork();
  
	try {
	  await contract.submitTransaction('InitLedger');
	  res.status(200).json({ message: 'Ledger initialized successfully' });
	} catch (error) {
	  console.error('Error initializing ledger:', error);
	  res.status(500).json({ error: 'Error initializing ledger' });
	}
  });

// API 1: Push Document Upload into Network
app.post('/api/pushDocumentUpload', async (req, res) => {
	const contract = await connectToNetwork();
  
	try {
	  const { documentID, contributorKey, dateTimeStamp, documentType } = req.body;
	  if (!documentID || !contributorKey || !dateTimeStamp || !documentType) {
		throw new Error('Invalid input. Please provide all required fields.');
	  }
	  const result = await contract.submitTransaction('PushDocumentUpload', documentID, contributorKey, dateTimeStamp, documentType);
	  const response = JSON.parse(result.toString());
	  const txID = response.txID;
//	  console.log('Transaction hash:', response.txID);
	  res.status(200).json({ message: 'Document upload successful', transactionHash: txID });
	} catch (error) {
	  console.error('Error pushing document upload:', error);
	  res.status(500).json({ error: 'Error pushing document upload' });
	}
  });
  
  app.post('/api/pushPaymentTransaction', async (req, res) => {
	const contract = await connectToNetwork();
  
	try {
	  const { documentID, paymentData } = req.body;
	  if (!documentID || !paymentData) {
		throw new Error('Invalid input. Please provide all required fields.');
	  }
	  const result = await contract.submitTransaction('PushPaymentTransaction', documentID, JSON.stringify(paymentData)); // Convert paymentData to JSON string
	  const response = JSON.parse(result.toString());
	  const txID = response.txID;
	  
	  res.status(200).json({ transactionHash: txID, paymentData: paymentData });
	} catch (error) {
	  console.error('Error pushing payment transaction:', error);
	  res.status(500).json({ error: 'Error pushing payment transaction' });
	}
});
  

// API 3: Pull Document Upload Transactions from Network
app.get('/api/pullDocumentUploadTransactions', async (req, res) => {
  const contract = await connectToNetwork();

  try {
    const { contributorID } = req.query;
    const result = await contract.evaluateTransaction('pullDocumentUploadTransactions', contributorID);
    const transactions = JSON.parse(result.toString());
    res.status(200).json({ transactions: transactions });
  } catch (error) {
    console.error('Error pulling document upload transactions:', error);
    res.status(500).json({ error: 'Error pulling document upload transactions' });
  }
});

// API 4: Pull Payments for Document from Network
app.get('/api/pullPaymentsForDocument', async (req, res) => {
  const contract = await connectToNetwork();

  try {
    const { documentID } = req.query;
    const result = await contract.evaluateTransaction('pullPaymentsForDocument', documentID);
    const payments = JSON.parse(result.toString());
    res.status(200).json({ payments: payments });
  } catch (error) {
    console.error('Error pulling payments for document:', error);
    res.status(500).json({ error: 'Error pulling payments for document' });
  }
});


// API 5: Get All Assets
app.get('/api/getAllAssets', async (req, res) => {
	const contract = await connectToNetwork();
	
	try {
	  const result = await contract.evaluateTransaction('GetAllAssets');
	  const assets = JSON.parse(result);
  
	  res.json({assets});
	} catch (error) {
	  console.error('Error getting all assets:', error);
	  console.log(error.payload);
	  res.status(500).json({ error: 'Error getting all assets' });
	}
  });
  

// Start the server
app.listen(port, () => {
  console.log(`API server is running on http://localhost:${port}`);
});