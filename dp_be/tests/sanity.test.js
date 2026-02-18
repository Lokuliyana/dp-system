const app = require('../src/app')

describe('Sanity Check', () => {
    it('should import app without crashing', () => {
        expect(app).toBeDefined()
    })
})
