'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 4000;
const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');

// Import necessary functions from CAUtil.js and AppUtil.js
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../test-application/javascript/CAUtil.js');
const { buildCCPOrg1, buildWallet } = require('../test-application/javascript/AppUtil.js');

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

app.post('/api/createDocumentUpload', async (req, res) => {
  const { documentId, contributorId, timestamp } = req.body;
  const contract = await connectToNetwork();

  try {
    const result = await contract.submitTransaction('pushDocumentUpload', documentId, contributorId, timestamp);
    const newDocument = JSON.parse(result.toString());
    res.status(200).json({ document: newDocument });
  } catch (error) {
    console.error('Error creating new document upload:', error);
    res.status(500).json({ error: 'Error creating new document upload' });
  }
});

app.get('/api/getAllAssets', async (req, res) => {
  const contract = await connectToNetwork();

  try {
    const result = await contract.evaluateTransaction('GetAllAssets');
    const allAssets = JSON.parse(result.toString());
    res.status(200).json({ assets: allAssets });
  } catch (error) {
    console.error('Error getting all assets:', error);
    res.status(500).json({ error: 'Error getting all assets' });
  }
});

app.get('/api/getDocumentUploadTransactions/:contributorId', async (req, res) => {
  const { contributorId } = req.params;
  const contract = await connectToNetwork();

  try {
    const result = await contract.evaluateTransaction('pullDocumentUploadTransactions', contributorId);
    const transactions = JSON.parse(result.toString());
    res.status(200).json({ transactions });
  } catch (error) {
    console.error('Error getting document upload transactions:', error);
    res.status(500).json({ error: 'Error getting document upload transactions' });
  }
});

app.get('/api/getPaymentsForDocument/:documentId', async (req, res) => {
  const { documentId } = req.params;
  const contract = await connectToNetwork();

  try {
    const result = await contract.evaluateTransaction('pullPaymentsForDocument', documentId);
    const payments = JSON.parse(result.toString());
    res.status(200).json({ payments });
  } catch (error) {
    console.error('Error getting payments for document:', error);
    res.status(500).json({ error: 'Error getting payments for document' });
  }
});

app.get('/api/getAllAssets', async (req, res) => {
	const contract = await connectToNetwork();
  
	try {
	  const result = await contract.evaluateTransaction('GetAllAssets');
	  const allAssets = JSON.parse(result.toString());
	  res.status(200).json({ assets: allAssets });
	} catch (error) {
	  console.error('Error getting all assets:', error);
	  res.status(500).json({ error: 'Error getting all assets' });
	}
  });

app.listen(port, () => {
  console.log(`API server is running on http://localhost:${port}`);
});
