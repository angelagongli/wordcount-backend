module.exports = function(sequelize, DataTypes) {
    const Paper = sequelize.define("Paper", {
        fileName: DataTypes.STRING,
        path: DataTypes.STRING,
        text: DataTypes.TEXT("long"),
        wordCount: DataTypes.INTEGER
    });    
    return Paper;
};
