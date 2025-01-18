import crypto = require('crypto');

const BASE_URL:string = "https://api.candorstudios.net/api";
const LICENSE_PUBLIC_KEY:string = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA80AWjlgESmTlrqOfG7Rtyd30+IHryCkDf+phuFQuDI2AhEa1DnJ9xsz4gPYNOWzLxDz6cBBlpZ+4KgzyO/uKDJDjPgp4TTrTncdEuLgXr5zCKpuXU29pABncZrnZYxvFohB2BYRaWD+BGvSCCZfihcFcUZ67Kwy0rWeEFhew8w8uWc8Vg3nYtY6TYD09jK7eUD2dckcybzGbgypFsV5fZ4kScqelBBD9xqv3oWc8/wJJffPAdQeRrkQTaQMKM95bHOgpSckrRS5xc/NLlQ+DFPyXqZ4guvnkgS8UgKK4/7GGVQ4AdC11Z8y6hx5++1owBXAbsViCcQBY35g9hQyB9QIDAQAB";

export class Candor {
    private readonly publicApiKey: string;

    constructor(publicApiKey:string) {
        this.publicApiKey = publicApiKey;
    }

    /**
     * Verifies a license key using the API.
     * <p>This endpoint uses RSA signatures to verify the license key, ensuring that it is valid and not tampered with, which this method handles for you.
     * <p>You should be retrieving the licenseKey from a local config file or from remote configs so that the client can enter it. Then, run this function before
     * allowing the user to access the product (shutdown if it fails).
     *
     * @param licenseKey The license key to verify.
     * @param productId  The product ID to verify the license key for.
     * @return Boolean indicating if the license key is valid.
     */
    async verifyLicense(licenseKey:string, productId:string):Promise<boolean> {
        const response = await fetch(`${BASE_URL}/products/${productId}/verify-license`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': this.publicApiKey
            },
            body: JSON.stringify({
                license: licenseKey,
            })
        });

        if (!response.ok)  throw new Error(response.statusText);
        const data = await response.json();


        const license = data.license;
        const timestamp = data.timestamp;
        const valid = data.valid;
        const signature = data.signature;
        const product = data['product'];

        const licenseData = `license=${license}&valid=${valid}&timestamp=${timestamp}&product=${product}`;

        const keySpec = Buffer.from(LICENSE_PUBLIC_KEY, "base64");
        const publicKey = crypto.createPublicKey({
            key: keySpec,
            format: "der",
            type: "spki",
        });

        const verifier = crypto.createVerify("SHA256");
        verifier.update(licenseData);
        verifier.end();

        const isVerified = verifier.verify(publicKey, Buffer.from(signature, "base64"));

        if (!isVerified) {
            console.error("License key verification failed.");
            return false;
        }

        return data.valid;
    }

    /**
     * Retrieves a remote config's values.
     *
     * @param configId The ID of the config to retrieve.
     * @return An object representing the config's values.
     */
    async getConfig(configId:string):Promise<any> {
        const response = await fetch(`${BASE_URL}/configs/${configId}/retrieve-values`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': this.publicApiKey
            },
        });

        if (!response.ok)  throw new Error(response.statusText);

        return await response.json();
    }

    /**
     * Returns reviews for a specific user.
     * @param user The user to get reviews for.
     * @return An array of reviews.
     */
    async getReviews(user:string):Promise<CandorReview[]> {
        const response = await fetch(`${BASE_URL}/reviews/freelancer/${user}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': this.publicApiKey
            },
        });

        if (!response.ok)  throw new Error(response.statusText);

        return await response.json();
    }
}

export type CandorReview = {
    rating:number;
    review:string;
    reviewer:CandorUser;
    reviewed:CandorUser;
}

export type CandorUser = {
    id:string;
    username:string;
    contact_email:string;
    bio:string;
    type:CandorUserType;
    freelancer_profile:CandorFreelancerProfile|null;
    avatar_url:string;
}

export type CandorFreelancerProfile = {
    portfolio:string;
    timezone:string;
    average_rating:number;
}

export enum CandorUserType {
    NATIVE,
    DISCORD
}

export default Candor;