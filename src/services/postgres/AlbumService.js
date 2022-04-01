const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const { mapDBToModelAlbum } = require('../../utils');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumsService {
    constructor() {
        this._pool = new Pool();
    }

    async addAlbum({
        name, year,
    }) {
        const id = `album-${nanoid(16)}`;

        const query = {
            text: 'INSERT INTO albums VALUES($1, $2, $3)',
            value: [id, name, year],
        };
    
        const result = await this._pool.query(query);
    
        if (!result.rows[0].id) {
            throw InvariantError('Album tidak dapat ditambahkan');
        }
        
        return result.rows[0].id;
    }

    async getAlbums() {
        const result = await this._pool.query('SELECT * FROM albums');
        return result.rows.map(mapDBToModelAlbum);
    }

    async getAlbumById(id) {
        const query = {
            text: 'SELECT * FROM albums WHERE id = $1',
            values: [id],
        };
        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Album tidak ditemukan');
        }

        return result.rows.map(mapDBToModelAlbum)[0];
    }

    async editAlbumById(id, { name, year }) {
        const query = {
            text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
            value: [name, year, id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukanG');
        }
    }

    async deleteAlbumById(id) {
        const query = {
            text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
            value: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Gagal menghapus album. Id tidak ditemukan');
        }
    }
}

module.exports = AlbumsService;