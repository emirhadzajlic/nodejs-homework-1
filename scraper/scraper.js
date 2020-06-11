const cheerio = require("cheerio");
const axios = require("axios");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const csvWriter = createCsvWriter({
  path: "out.csv",
  header: [
    { id: "upc", title: "UPC" },
    { id: "type", title: "Product Type" },
    { id: "pricex", title: "Price (excl. tax)" },
    { id: "priceinc", title: "Price (incl. tax)" },
    { id: "tax", title: "Tax" },
    { id: "availability", title: "Availability" },
    { id: "nor", title: "Number of reviews" },
    {id: "url", title: "URL"}
  ],
});

var linkArr = [];
var data = [];

const fethHtml = async (url) => {
  try {
    const { data } = await axios.get(url);
    return data;
  } catch {
    console.error(
      `ERROR: An error occurred while trying to fetch the URL: ${url}`
    );
  }
};

const scrapVijesti = async () => {
  const url = "http://books.toscrape.com/";

  const html = await fethHtml(url);

  const $ = cheerio.load(html);

  $("body")
    .find("article.product_pod")
    .toArray()
    .forEach((e) => {
      var details;
      $(e)
        .find("a")
        .each((i, e) => {
          details = "http://books.toscrape.com/" + e.attribs.href;
        });
      linkArr.push(details);
    });
    
  var x;

  for (let l = 0; l < 20; l++) {
    const html = await fethHtml(linkArr[l]);

    const $ = cheerio.load(html);
    x = $("tbody > tr td")
      .toArray()
      .map((x) => {
        return $(x).text();
      });

    data.push({
      upc: x[0],
      type: x[1],
      pricex: x[2],
      priceinc: x[3],
      tax: x[4],
      availability: x[5],
      nor: x[6],
      url: linkArr[l]
    });
  }
  csvWriter
    .writeRecords(data)
    .then(() => console.log("The CSV file was written successfully"));

  return;
};

scrapVijesti()