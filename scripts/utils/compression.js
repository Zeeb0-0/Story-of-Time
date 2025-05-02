import DEBUG from './debug.js';

export class CompressionUtil {
    static async compress(data) {
        try {
            const jsonString = JSON.stringify(data);
            const uint8Array = new TextEncoder().encode(jsonString);
            
            return await (window.CompressionStream ? 
                this._streamCompress(uint8Array) : 
                this._fallbackCompress(uint8Array));
        } catch (error) {
            DEBUG.log(`Compression failed: ${error.message}`, 'error');
            throw error;
        }
    }

    static async decompress(compressed) {
        try {
            const decompressed = await (window.CompressionStream ?
                this._streamDecompress(compressed) :
                this._fallbackDecompress(compressed));
            
            const jsonString = new TextDecoder().decode(decompressed);
            return JSON.parse(jsonString);
        } catch (error) {
            DEBUG.log(`Decompression failed: ${error.message}`, 'error');
            throw error;
        }
    }

    static async _streamCompress(uint8Array) {
        const stream = new Blob([uint8Array]).stream();
        const compressedStream = stream.pipeThrough(new CompressionStream('gzip'));
        return new Uint8Array(await new Response(compressedStream).arrayBuffer());
    }

    static async _streamDecompress(compressed) {
        const stream = new Blob([compressed]).stream();
        const decompressedStream = stream.pipeThrough(new DecompressionStream('gzip'));
        return new Uint8Array(await new Response(decompressedStream).arrayBuffer());
    }

    static _fallbackCompress(uint8Array) {
        // Simple RLE compression for fallback
        const compressed = [];
        let count = 1;
        let current = uint8Array[0];

        for (let i = 1; i < uint8Array.length; i++) {
            if (uint8Array[i] === current && count < 255) {
                count++;
            } else {
                compressed.push(count, current);
                count = 1;
                current = uint8Array[i];
            }
        }
        compressed.push(count, current);

        return new Uint8Array(compressed);
    }

    static _fallbackDecompress(compressed) {
        const decompressed = [];
        
        for (let i = 0; i < compressed.length; i += 2) {
            const count = compressed[i];
            const value = compressed[i + 1];
            decompressed.push(...Array(count).fill(value));
        }
        
        return new Uint8Array(decompressed);
    }

    static async compressSaveData(saveData) {
        try {
            const dataWithMetadata = {
                ...saveData,
                _metadata: {
                    compressed: true,
                    timestamp: '2025-05-02 11:38:00',
                    user: 'Zeeb0-0',
                    version: '1.0.0'
                }
            };
            
            return await this.compress(dataWithMetadata);
        } catch (error) {
            DEBUG.log('Save data compression failed', 'error');
            throw error;
        }
    }

    static async decompressSaveData(compressed) {
        try {
            const data = await this.decompress(compressed);
            
            // Verify metadata
            if (!data._metadata || !data._metadata.compressed) {
                throw new Error('Invalid compressed save data');
            }
            
            // Remove metadata before returning
            const { _metadata, ...saveData } = data;
            return saveData;
        } catch (error) {
            DEBUG.log('Save data decompression failed', 'error');
            throw error;
        }
    }
}