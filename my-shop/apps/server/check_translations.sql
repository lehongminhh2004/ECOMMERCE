-- Check available language codes in channel
SELECT "availableLanguageCodes" FROM channel WHERE id = 1;

-- Double-check search index entries
SELECT "languageCode", COUNT(*) as total FROM search_index_item GROUP BY "languageCode";
