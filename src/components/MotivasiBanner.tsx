import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Papa from 'papaparse';

const CSV_URL = 'https://docs.google.com/spreadsheets/d/1nAFEkg1KZ4SU4o0pk7KqMHH2Lz4QA_lqj8IBWCZdyGQ/export?format=csv&gid=803314011';
const UPDATE_INTERVAL = 30 * 1000; // 30 seconds for "real-time"

export const MotivasiBanner: React.FC = () => {
  const [quote, setQuote] = useState<string>("Memuat inspirasi...");
  const [isLoading, setIsLoading] = useState(false);

  const fetchQuote = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(CSV_URL);
      const csvText = await response.text();
      
      Papa.parse(csvText, {
        complete: (results) => {
          const rows = results.data as string[][];
          
          // The user mentioned range B2:J9. 
          // In CSV export, B2 would be row index 1, column index 1.
          // We'll filter out empty rows and pick a random one from the available data.
          const validQuotes: string[] = [];
          
          // Iterate through rows (starting from row 1 to skip header if B2 is where it starts)
          // and columns B to J (index 1 to 9)
          for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row) continue;
            
            // Check columns B to J
            for (let j = 1; j <= 9; j++) {
              const cell = row[j];
              if (cell && cell.trim().length > 5) {
                validQuotes.push(cell.trim());
              }
            }
          }

          if (validQuotes.length > 0) {
            const randomQuote = validQuotes[Math.floor(Math.random() * validQuotes.length)];
            setQuote(randomQuote);
          } else {
            // Fallback if no quotes found in range
            setQuote("Kebijaksanaan dimulai dengan rasa ingin tahu. - Socrates");
          }
          setIsLoading(false);
        },
        error: (err) => {
          console.error("Gagal memproses CSV:", err);
          setIsLoading(false);
        }
      });
    } catch (error) {
      console.error("Gagal mengambil motivasi:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuote();
    const intervalId = setInterval(fetchQuote, UPDATE_INTERVAL);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="w-full bg-gradient-to-r from-amber-500/40 via-orange-600/40 to-amber-500/40 backdrop-blur-md text-white px-6 py-3 shadow-md rounded-xl mb-6 relative overflow-hidden flex items-center justify-center min-h-[56px] border border-white/10">
      {/* Shimmer Effect Overlay */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: "200%" }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          repeatDelay: 1,
        }}
        className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg]"
      />
      
      <div className="absolute inset-0 bg-white/5 pointer-events-none"></div>
      
      <div className="relative z-10 w-full text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={quote + isLoading}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            <motion.p
              animate={{ 
                textShadow: [
                  "0 0 4px rgba(255,255,255,0.2)",
                  "0 0 12px rgba(255,255,255,0.6)",
                  "0 0 4px rgba(255,255,255,0.2)"
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
              className="text-xs sm:text-sm font-black italic drop-shadow-md text-white"
            >
              {quote}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

