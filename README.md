# financeTracker
Application to track finances taking in a CSV form of your statement. Multiple statements can be joined together to gain further detail

A config file is required which should be a json file in the main directory with the following layout
{
  "statementFolderPath": 
  "statementName": 
  "unjoinedStatementFolder":
}

unjoinedStatementFolder is the folder where any individual statements wanting to be merged should be stored in a CSV format by joinStatements script
statementFolderPath is the directory in which the merged statements or individual statement should be stored to be run by the runFinances script
statementName is the name of the file (without the .csv extension) that runFinances starts with and joinStatements saves
