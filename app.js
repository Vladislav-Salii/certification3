const http = require('http');
const axios = require('axios');
const url = require('url');

const port = 3000;

const server = http.createServer(async (req, res) => {
    try {
        const parsedUrl = url.parse(req.url, true);
        const pathname = parsedUrl.pathname;
        const query = parsedUrl.query;

        if (pathname === '/country' && query.name) {
            const countryName = query.name;
            const response = await axios.get(`https://restcountries.com/v3.1/name/${countryName}`);
            const country = response.data[0];

            let countryCardHtml = `
                <html>
                    <head>
                        <style>
                            body {
                                font-family: 'Arial', sans-serif;
                                text-align: center;
                                margin: 20px;
                                background-color: #f0f0f0;
                            }

                            h1 {
                                color: #333;
                            }

                            div.card {
                                border: 1px solid #ddd;
                                padding: 20px;
                                margin: 20px;
                                background-color: #fff;
                                border-radius: 8px;
                                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                            }

                            div.card img {
                                max-width: 100%;
                                height: auto;
                                border-radius: 4px;
                            }

                            p {
                                font-size: 16px;
                                line-height: 1.6;
                            }

                            strong {
                                color: #0074D9;
                            }

                            a {
                                color: #0074D9;
                                text-decoration: none;
                            }

                            a:hover {
                                text-decoration: underline;
                            }
                        </style>
                        <title>${country.name.common}</title>
                    </head>
                    <body>
                        <h1>${country.name.common}</h1>
                        <div class="card">
                            <img src="${getFlagUrl(country)}" alt="${country.name.common} Flag">
                            <p><strong>Area:</strong> ${country.area} square kilometers</p>
                            <p><strong>Population:</strong> ${country.population}</p>
                            <p><strong>Currencies:</strong> ${getCurrencies(country)}</p>
                            <p><strong>Capital:</strong> ${getCapital(country)}</p>
                            <p><strong>Region:</strong> ${getRegion(country)}</p>
                            <!-- Додайте інші ключові дані, які вам цікаві -->
                        </div>
                    </body>
                </html>
            `;

            res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
            res.end(countryCardHtml);
        } else {
            const option = query.value || '';
            const response = await axios.get('https://restcountries.com/v3.1/all');
            const countries = response.data;

            let htmlContent = `
                <html>
                    <head>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                text-align: center;
                                margin: 20px;
                            }

                            h1 {
                                color: #333;
                            }

                            table {
                                width: 100%;
                                border-collapse: collapse;
                                margin-top: 20px;
                            }

                            th, td {
                                border: 1px solid #ddd;
                                padding: 10px;
                                text-align: left;
                            }

                            th {
                                background-color: #f2f2f2;
                            }

                            a {
                                color: #0074D9;
                                text-decoration: none;
                            }

                            a:hover {
                                text-decoration: underline;
                            }

                            button {
                                background-color: #0074D9;
                                color: #fff;
                                border: none;
                                padding: 10px 20px;
                                cursor: pointer;
                                margin: 5px;
                            }
                        </style>
                        <title>Список країн</title>
                    </head>
                    <body>
                        <h1>Виберіть опцію:</h1>
                        <button onclick="location.href='/option?value=countries'">Переглянути всі країни світу</button>
                        <button onclick="location.href='/option?value=currencies'">Переглянути всі валюти світу</button>
                        <button onclick="location.href='/option?value=capitals'">Столиці світу</button>
            `;

            if (option === 'countries' || option === 'currencies' || option === 'capitals') {
                htmlContent += `
                                <table>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>${option === 'currencies' ? 'Currencies' : option.charAt(0).toUpperCase() + option.slice(1)}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                `;

                countries.forEach((country, index) => {
                    let data;
                    if (option === 'countries') {
                        data = country.name.common.toLowerCase();
                    } else if (option === 'currencies') {
                        data = country.currencies
                            ? Object.values(country.currencies)
                                .map((currency) => currency.name.toLowerCase())
                                .join(', ')
                            : '';
                    } else if (option === 'capitals') {
                        data = country.capital
                            ? Array.isArray(country.capital)
                                ? country.capital.map((capital) => capital.toLowerCase()).join(', ')
                                : country.capital.toLowerCase()
                            : '';
                    }

                    const countryPageLink = `/country?name=${encodeURIComponent(country.name.common)}`;

                    htmlContent += `
                                        <tr>
                                            <td>${index + 1}</td>
                                            <td><a href="${countryPageLink}">${data}</a></td>
                                        </tr>
                    `;
                });

                htmlContent += `
                                    </tbody>
                                </table>
                `;
            }

            htmlContent += `
                    </body>
                </html>
            `;

            res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
            res.end(htmlContent);
        }
    } catch (error) {
        console.error('Помилка у виконанні запиту:', error.message);
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=UTF-8' });
        res.end('Помилка у виконанні запиту');
    }
});

function getFlagUrl(country) {
    if (country.flags && country.flags.png) {
        return country.flags.png;
    }
    return '';
}

function getCurrencies(country) {
    if (country.currencies) {
        return Object.values(country.currencies)
            .map((currency) => currency.name)
            .join(', ');
    }
    return '';
}

function getCapital(country) {
    if (country.capital) {
        return Array.isArray(country.capital)
            ? country.capital.join(', ')
            : country.capital;
    }
    return '';
}

function getRegion(country) {
    if (country.region) {
        return country.region;
    }
    return '';
}

server.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
