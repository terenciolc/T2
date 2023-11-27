const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

app.use(express.static('public'));

app.use((req, res, next) => {
    console.log(`Recebendo solicitação: ${req.method} ${req.url}`);
    next();
});

app.get('/clima/:cidade', async (req, res) => {
    try {
        const cidade = req.params.cidade.replace(/%20/g, ' ');
        console.log('Recebendo solicitação para /clima/:cidade', cidade);

        const coordenadas = await obterCoordenadasPorCidade(cidade);
        console.log('Coordenadas obtidas:', coordenadas);

        const condicoesAtuais = await obterCondicoesAtuais(coordenadas.latitude, coordenadas.longitude);
        console.log('Condições atuais obtidas:', condicoesAtuais);

        res.json({
            cidade,
            coordenadas,
            condicoesAtuais,
        });
    } catch (error) {
        console.error('Erro ao consultar o clima:', error.message);
        res.status(500).json({ error: 'Erro ao obter informações climáticas.' });
    }
});

async function obterCoordenadasPorCidade(cidade) {
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${cidade}&limit=1&appid=01f37c541e0ab5db2b2e250b0a1fe6ba`;

    try {
        const response = await axios.get(url);

        if (response.data && response.data.length > 0) {
            const { lat, lon } = response.data[0];
            return { latitude: lat, longitude: lon };
        } else {
            console.error('Resposta da API de geocodificação:', response.data);
            throw new Error('Não foi possível obter coordenadas para a cidade especificada.');
        }
    } catch (error) {
        console.error('Erro ao obter coordenadas:', error.message);
        throw error;
    }
}

async function obterCondicoesAtuais(latitude, longitude) {
    const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=minutely,hourly,daily&appid=01f37c541e0ab5db2b2e250b0a1fe6ba`;

    try {
        const response = await axios.get(url);
        const { feels_like, weather } = response.data.current;

        return {
            feels_like,
            descricao: weather[0].description,
        };
    } catch (error) {
        console.error('Erro ao obter condições atuais:', error.message);
        throw error;
    }
}

app.listen(port, () => {
    console.log(`Servidor em execução em http://localhost:${port}`);
});
