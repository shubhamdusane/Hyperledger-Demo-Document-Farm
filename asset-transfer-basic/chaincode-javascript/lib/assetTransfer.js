/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

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
        const txID = ctx.stub.getTxID(); // Get the Commit Hash (Transaction ID)
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
            TxID: txID, // Include the transaction ID in the asset data
        };

        await ctx.stub.putState(documentId, Buffer.from(JSON.stringify(sortKeysRecursive(asset))));
        return { asset: asset, txID: txID };
    }

 /*   // CreateAsset issues a new asset to the world state with given details.
    async CreateAsset(ctx, id, owner) {
        const exists = await this.AssetExists(ctx, id);
        if (exists) {
            throw new Error(`The asset ${id} already exists`);
        }

        const asset = {
            DocumentId: id,
            ContributerId: owner,
        };
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(asset))));
        return JSON.stringify(asset);
    }
*/
async PushPaymentTransaction(ctx, documentId, paymentData) {
    if (!documentId || !paymentData) {
        throw new Error('Invalid input');
    }

    // Get the existing asset from the world state
    const assetJSON = await ctx.stub.getState(documentId);
    if (!assetJSON || assetJSON.length === 0) {
        throw new Error(`The asset ${documentId} does not exist`);
    }
    const asset = JSON.parse(assetJSON.toString());

    // Create a new payment transaction ID
    const paymentTxID = ctx.stub.getTxID();

    // Serialize the payment data object before adding it to the asset
    const paymentDataString = JSON.stringify(paymentData);

    // Add the payment data and the new transaction ID to the asset
    asset.Payments = asset.Payments || [];
    asset.Payments.push({ TxID: paymentTxID, PaymentData: paymentDataString });

    // Update the asset in the world state with the new data
    await ctx.stub.putState(documentId, Buffer.from(JSON.stringify(asset)));

    // Return a response with the message and the new transaction ID
    return { message: `Payment transaction for Document ID ${documentId} has been recorded`, txID: paymentTxID };
}


// async PushPaymentTransaction(ctx, documentId, paymentData) {
//     if (!documentId || !paymentData) {
//         throw new Error('Invalid input');
//     }

//     // Get the existing asset from the world state
//     const assetJSON = await ctx.stub.getState(documentId);
//     if (!assetJSON || assetJSON.length === 0) {
//         throw new Error(`The asset ${documentId} does not exist`);
//     }
//     const asset = JSON.parse(assetJSON.toString());

//     // Create a new payment transaction ID
//     const paymentTxID = ctx.stub.getTxID();

//     // Add the payment data and the new transaction ID to the asset
//     asset.Payments = asset.Payments || [];
//     asset.Payments.push({ TxID: paymentTxID, PaymentData: paymentData });

//     // Update the asset in the world state with the new data
//     await ctx.stub.putState(documentId, Buffer.from(JSON.stringify(sortKeysRecursive(asset))));

//     // Return a response with the message and the new transaction ID
//     return { message: `Payment transaction for Document ID ${documentId} has been recorded`, txID: paymentTxID };

//     // const paymentKey = ctx.stub.createCompositeKey('payment', [documentId, ctx.stub.getTxID()]);

//     // await ctx.stub.putState(paymentKey, Buffer.from(JSON.stringify(paymentData)));
//     // const txID = ctx.stub.getTxID(); // Get the Commit Hash (Transaction ID)
//     // return { message: `Payment transaction for Document ID ${documentId} has been recorded`, txID: txID }; // Return message and Commit Hash
// }

    // ReadAsset returns the asset stored in the world state with given id.
    async ReadAsset(ctx, documentId) {
        const assetJSON = await ctx.stub.getState(documentId); // get the asset from chaincode state
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The asset ${documentId} does not exist`);
        }
        return assetJSON.toString();
    }

    // // UpdateAsset updates an existing asset in the world state with provided parameters.
    // async UpdateAsset(ctx, documentId, contributorId, paymentData) {
    //     const exists = await this.AssetExists(ctx, documentId);
    //     if (!exists) {
    //         throw new Error(`The asset ${documentId} does not exist`);
    //     }

    //     // overwriting original asset with new asset
    //     const updatedAsset = {
    //         ID: documentId,
    //         ContributerId: contributorId,
    //         DateTimeStamp: timestamp, 
    //     };
    //     // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
    //     return ctx.stub.putState(documentId, Buffer.from(stringify(sortKeysRecursive(updatedAsset))));
    // }

    // // DeleteAsset deletes an given asset from the world state.
    // async DeleteAsset(ctx, documentId) {
    //     const exists = await this.AssetExists(ctx, documentId);
    //     if (!exists) {
    //         throw new Error(`The asset ${documentId} does not exist`);
    //     }
    //     return ctx.stub.deleteState(documentId);
    // }

    // // AssetExists returns true when asset with given DocumentId exists in world state.
    // async AssetExists(ctx, documentId) {
    //     const assetJSON = await ctx.stub.getState(documentId);
    //     return assetJSON && assetJSON.length > 0;
    // }

    async pullDocumentUploadTransactions(ctx, contributorId) {

        if(!contributorId) {
          throw new Error('Invalid contributor ID');
        }
    
        const query = {
          selector: {
            ContributorKey: contributorId
          }
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

      async pullPaymentsForDocument(ctx, documentId) {

        if(!documentId) {
          throw new Error('Invalid doc ID');  
        }
    
        const query = {
          selector: {
            ID: documentId
          }
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
