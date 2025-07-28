import useSWR from "swr";

async function fetchAPI(key) {
    const response = await fetch(key);
    const responseBody = await response.json();
    return responseBody;
}

export default function StatusPage() {
    return (
        <>
            <h1>Status</h1>
            <UpdatedAt />
            <DatabaseStatus />
        </>
    );
}

function UpdatedAt() {
    const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
        refreshInterval: 2000,
    });

    let updatedAtText = "Carregando...";
    if (!isLoading && data) {
        updatedAtText = new Date(data.updated_at).toLocaleString("pt-BR");
    }

    return <div>Última atualização: {updatedAtText}</div>;
}

function DatabaseStatus() {
    const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
        refreshInterval: 2000,
    });

    const loadingText = "Carregando...";
    let databaseVersionText = loadingText;
    let databaseMaxConnext = loadingText;
    let databaseCurrentConnText = loadingText;
    if (!isLoading && data) {
        databaseVersionText = data.dependencies.database.version || loadingText;
        databaseMaxConnext =
            data.dependencies.database.max_connections || loadingText;
        databaseCurrentConnText =
            data.dependencies.database.current_connections || loadingText;
    }
    return (
        <div>
            <h2>Banco de Dados</h2>
            <p>Versão: {databaseVersionText}</p>
            <p>Max. Conexões: {databaseMaxConnext}</p>
            <p>Conexões atuais: {databaseCurrentConnText}</p>
        </div>
    );
}
