/** @type {import('next').NextConfig} */

const restAddress = process.env.REST_HOST_ADDRESS;
if (!restAddress) {
    throw new Error("REST_HOST_ADDRESS is not set");
}

const restPort = process.env.REST_PORT;
if (!restPort) {
    throw new Error("REST_PORT is not set");
}

const baseRestApiUrl = `http://${restAddress}:${restPort}`;

const nextConfig = {
    output: "standalone",
    async redirects() {
        return [
            {
                source: '/',
                destination: '/login',
                permanent: true,
            }
        ];
    },

    async rewrites() {
        return [
            {
                source: '/api/:slug*',
                destination: `${baseRestApiUrl}/api/:slug*`,
            },
        ];
    }


};

export default nextConfig;
