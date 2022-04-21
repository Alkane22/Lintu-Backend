const userExtractor = (req, res, next) => {
    const decodeToken = jwt.verify(req.token, process.env.SECRET)
    if (!req.token || !decodeToken.id) {
        return res.status(401).json({
            error: 'token missing or invalid'
        })
    }
    req.user = decodeToken
    next()
}