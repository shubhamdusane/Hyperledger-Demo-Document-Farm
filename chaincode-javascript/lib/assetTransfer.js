'use strict';

// Deterministic JSON.stringify()
const stringify  = require('json-stringify-deterministic');
const sortKeysRecursive  = require('sort-keys-recursive');
const { Contract } = require('fabric-contract-api');

class AssetTransfer extends Contract {
  async InitLedger(ctx) {
    const assets = [
        {
            ID: '1',
          ContributorKey: 'Alice',
          DateTimeStamp: '2023-07-31T12:00:00Z',
          Type: 'DocumentUpload'
        },
        {
          ID: '2', 
          ContributorKey: 'Bob',
          DateTimeStamp: '2023-07-31T14:30:00Z',
          Type: 'DocumentUpload'
        }
      ];

    for (const asset of assets) {
        asset.docType = 'asset';
        // example of how to write to world state deterministically
        // use convetion of alphabetic order
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        // when retrieving data, in any lang, the order of data will be the same and consequently also the corresonding hash
        await ctx.stub.putState(asset.ID, Buffer.from(stringify(sortKeysRecursive(asset))));
    }
}

    async PushDocumentUpload(ctx, documentId, contributorKey, dateTimeStamp, documentType) {
        const exists = await this.AssetExists(ctx, documentId);
        if (exists) {
            throw new Error(`The asset ${documentId} already exists`);
        }

        if (!documentId || !contributorKey || !dateTimeStamp || !documentType) {
            throw new Error('Invalid input');
        }

        const asset = {
            ID: documentId,
            ContributorKey: contributorKey,
            DateTimeStamp: dateTimeStamp,
            Type: documentType,
        };

        await ctx.stub.putState(documentId, Buffer.from(JSON.stringify(sortKeysRecursive(asset))));
        return JSON.stringify(asset);
    }

    async PushPaymentTransaction(ctx, documentId, paymentData) {
        if (!documentId || !paymentData) {
            throw new Error('Invalid input');
        }

        const paymentKey = ctx.stub.createCompositeKey('payment', [documentId, ctx.stub.getTxID()]);

        await ctx.stub.putState(paymentKey, Buffer.from(JSON.stringify(paymentData)));
        return `Payment transaction for Document ID ${documentId} has been recorded`;
    }

    async PullDocumentUploadTransactions(ctx, contributorId) {
        if (!contributorId) {
            throw new Error('Invalid contributor ID');
        }

        const query = {
            selector: {
                ContributorKey: contributorId,
            },
        };

        const iterator = await ctx.stub.getQueryResult(JSON.stringify(query));
        const results = [];

        let result = await iterator.next();

        while (!result.done) {
            if (result.value && result.value.value.toString()) {
                results.push(JSON.parse(result.value.value.toString()));
            }
            result = await iterator.next();
        }

        return JSON.stringify(results);
    }

    async PullPaymentsForDocument(ctx, documentId) {
        if (!documentId) {
            throw new Error('Invalid document ID');
        }

        const query = {
            selector: {
                ID: documentId,
            },
        };

        const iterator = await ctx.stub.getQueryResult(JSON.stringify(query));
        const results = [];

        let result = await iterator.next();

        while (!result.done) {
            if (result.value && result.value.value.toString()) {
                results.push(JSON.parse(result.value.value.toString()));
            }
            result = await iterator.next();
        }

        return JSON.stringify(results);
    }

    async GetContributorResults(ctx, contributorId) {
        if (!contributorId) {
            throw new Error('Invalid contributor ID');
        }

        const docUploadTransactions = await this.PullDocumentUploadTransactions(ctx, contributorId);
        const paymentTransactions = await this.PullPaymentsForDocument(ctx, contributorId);

        return JSON.stringify({
            documentUploadTransactions: JSON.parse(docUploadTransactions),
            paymentTransactions: JSON.parse(paymentTransactions),
        });
    }

    // Helper function to check if asset with given ID exists in world state.
    async AssetExists(ctx, documentId) {
        const assetJSON = await ctx.stub.getState(documentId);
        return assetJSON && assetJSON.length > 0;
    }

    // GetAllAssets returns all assets found in the world state.
    async GetAllAssets(ctx) {
      const allResults = [];
      // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
      const iterator = await ctx.stub.getStateByRange('', '');
      let result = await iterator.next();
      while (!result.done) {
          const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
          let record;
          try {
              record = JSON.parse(strValue);
          } catch (err) {
              console.log(err);
              record = strValue;
          }
          allResults.push(record);
          result = await iterator.next();
      }
      return JSON.stringify(allResults);
  }
}

module.exports = AssetTransfer;
