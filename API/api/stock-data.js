// A primeira linha carrega as variáveis de ambiente do ficheiro .env
// Isso é útil para testares o teu backend no teu computador antes de o implementares no Vercel.
require('dotenv').config(); 

// Importa a biblioteca 'node-fetch' para fazer pedidos HTTP (igual ao 'fetch' do navegador, mas para Node.js)
const fetch = require('node-fetch'); 

// Esta é a função principal que o Vercel vai executar sempre que este endpoint for acedido.
// 'req' (request) é o pedido que o teu frontend faz.
// 'res' (response) é a resposta que o teu backend vai enviar de volta para o frontend.
module.exports = async (req, res) => {
    // 1. Obtém a tua API Key da EOD Historical Data
    // Esta chave será carregada da variável de ambiente EOD_API_KEY que vais configurar no Vercel (e no teu .env local).
    const api_key = process.env.EOD_API_KEY;

    // 2. Define os símbolos das ações que queres buscar.
    // Podes adicionar mais símbolos aqui, separando-os por vírgulas.
    const symbols = "EDP.LS,REN.LS"; 

    // 3. Verifica se a API Key está definida. É uma verificação de segurança importante!
    if (!api_key) {
        // Se a chave não estiver configurada, envia uma mensagem de erro para o frontend.
        return res.status(500).json({ 
            error: "Erro do Servidor: A API Key da EODHD não está configurada.",
            details: "Certifique-se que a variável de ambiente EOD_API_KEY está definida no Vercel."
        });
    }

    // 4. Constrói o URL completo para a API da EOD Historical Data.
    // Usamos a API Key obtida da variável de ambiente, que permanece secreta.
    const eodhdUrl = `https://eodhistoricaldata.com/api/real-time/${symbols}?api_token=${api_key}&fmt=json`;

    try {
        // 5. Faz o pedido HTTP real para a API da EOD Historical Data.
        const response = await fetch(eodhdUrl);
        
        // 6. Verifica se a resposta da EODHD foi bem-sucedida (status 2xx).
        if (!response.ok) {
            // Se houver um erro na resposta da EODHD (ex: 401 Unauthorized, 404 Not Found, 500 Server Error),
            // lê o texto do erro e lança uma exceção para o bloco 'catch' tratar.
            const errorText = await response.text();
            throw new Error(`Erro da API EODHD: Status ${response.status} - ${errorText}`);
        }
        
        // 7. Converte a resposta da EODHD de JSON para um objeto JavaScript.
        const data = await response.json();
        
        // 8. Envia os dados recebidos da EODHD de volta para o teu frontend (index.html).
        // Um status 200 indica sucesso.
        res.status(200).json(data); 

    } catch (error) {
        // 9. Se ocorrer qualquer erro durante o processo (rede, API Key inválida, etc.),
        // regista o erro na consola do servidor e envia uma mensagem de erro para o frontend.
        console.error("Erro ao buscar dados da EODHD:", error);
        res.status(500).json({ 
            error: "Falha ao buscar dados da bolsa.", 
            details: error.message 
        });
    }
};
