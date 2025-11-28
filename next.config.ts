/** @type {import('next').NextConfig} */
const nextConfig = {
	output: 'export', // Das aktiviert den statischen Export
	images: {
		unoptimized: true, // Nötig für statischen Export
	},
};

export default nextConfig;
