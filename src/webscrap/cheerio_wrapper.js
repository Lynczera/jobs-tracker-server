const cheerio = require("cheerio");
const axios = require("axios");
const { json } = require("body-parser");

const axiosRetry = require("axios-retry").default;
axiosRetry(axios, {
	retries: 10,
	retryCondition(error) {
		switch (error.response.status) {
			case 429:
				return true;
			default:
				return false;
		}
	},
});

module.exports.cheerio_wrapper = {

	get_job: async (url) => {

		const page = await axios(url)

		try {
			const data = page.data;
			const $ = cheerio.load(data);

			let content = [];
			$(".top-card-layout__title", data).each(function() {
				const title = $(this).text();

				content.push(title);
			});

			$(".topcard__org-name-link", data).each(function() {
				const compName = $(this)
					.text()
					.replace(/^\s*(.*?)\s*$/, "$1");

				content.push(compName);
			});
			result =
			{
				title: content[0],
				company: content[1],
			};
			return result
		}
		catch (error) {
			console.log(JSON.stringify(error));

			if (JSON.stringify(error)["status"] == 429) {
				console.log("ERROR FOUND SENDING TO CLIENT");
			} else {
				return null
			}
		};
	}
}
