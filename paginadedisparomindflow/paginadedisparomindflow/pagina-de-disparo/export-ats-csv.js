/**
 * export-ats-csv.js
 * Exporta todos os dados da tabela Retell_calls_Mindflow do cliente ATS (client_id=3)
 * para um arquivo CSV.
 *
 * Uso: node export-ats-csv.js
 */

require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const MAIN_SUPABASE_URL = process.env.SUPABASE_URL;
const MAIN_SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;
const ATS_CLIENT_ID = "3";

function escapeCSV(value) {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(";") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return '"' + str.replace(/"/g, '""').replace(/\r?\n/g, " ") + '"';
  }
  return str;
}

async function main() {
  console.log("Conectando ao Supabase principal...");
  const mainDb = createClient(MAIN_SUPABASE_URL, MAIN_SUPABASE_KEY);

  const { data: clientConfig, error: configError } = await mainDb
    .from("client_configurations")
    .select("client_id, client_name, supabase_url, supabase_service_key, supabase_anon_key")
    .eq("client_id", ATS_CLIENT_ID)
    .maybeSingle();

  if (configError || !clientConfig) {
    console.error("Erro ao buscar configuracao do ATS:", configError?.message || "Cliente nao encontrado");
    process.exit(1);
  }

  const atsName = clientConfig.client_name || "ATS";
  const atsUrl = clientConfig.supabase_url;
  const atsKey = clientConfig.supabase_service_key || clientConfig.supabase_anon_key;

  console.log("Cliente encontrado: " + atsName + " (ID: " + ATS_CLIENT_ID + ")");
  console.log("Supabase ATS: " + atsUrl);
  console.log("Buscando dados da tabela Retell_calls_Mindflow...");

  const atsDb = createClient(atsUrl, atsKey);
  const BATCH_SIZE = 1000;
  let allData = [];
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await atsDb
      .from("Retell_calls_Mindflow")
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, from + BATCH_SIZE - 1);

    if (error) {
      console.error("Erro ao buscar dados (offset " + from + "):", error.message);
      process.exit(1);
    }

    if (!data || data.length === 0) {
      hasMore = false;
    } else {
      allData = allData.concat(data);
      console.log("  -> " + allData.length + " registros carregados...");
      from += BATCH_SIZE;
      if (data.length < BATCH_SIZE) hasMore = false;
    }
  }

  if (allData.length === 0) {
    console.warn("Nenhum dado encontrado na tabela Retell_calls_Mindflow para o ATS.");
    process.exit(0);
  }

  console.log("Total: " + allData.length + " registros encontrados");

  const headers = Object.keys(allData[0]);
  const csvRows = [headers.join(";")];

  allData.forEach(function(row) {
    var line = headers.map(function(h) { return escapeCSV(row[h]); }).join(";");
    csvRows.push(line);
  });

  const csvContent = "\uFEFF" + csvRows.join("\n");

  const today = new Date().toISOString().slice(0, 10);
  const filename = "ats_ligacoes_" + today + ".csv";
  const outputPath = path.join(__dirname, filename);

  fs.writeFileSync(outputPath, csvContent, "utf8");

  console.log("\nCSV gerado com sucesso!");
  console.log("Arquivo: " + outputPath);
  console.log("Registros: " + allData.length);
  console.log("Colunas: " + headers.join(", "));
}

main().catch(function(err) {
  console.error("Erro fatal:", err.message);
  process.exit(1);
});
