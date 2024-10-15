require('dotenv').config();
const OpenAI = require('openai');
const DirectoryHelper = require('../../helpers/help.directory');
const fs = require('fs');

class Network {
  static api_key;
  static org_id;

  constructor(){
    this.init();
  }

  async init(){
    try{
      // Get the details from the global config file.
      const globalConfig = await fs.readFileSync(DirectoryHelper.getGlobalConfigFilePath(), 'utf-8');
      const globalConfigJson = JSON.parse(globalConfig);
      this.api_key = globalConfigJson.apiKey;
      this.org_id = globalConfigJson.orgId;
    } catch(e){
      console.log(e);
      throw new Error("Network Initialization Failed");
    }
  }

  /**
   * Generate code using DeepSeek Coder.
   * @param {string} prefix - The code before the target generation block.
   * @param {string} suffix - The code after the target generation block.
   * @returns {string} - The generated code response.
   */
  doRequest = async (requestData) => {
    try {
      const openai = new OpenAI.OpenAI({
        apiKey: this.api_key,
        organization: this.org_id,
      });

      const completions = await openai.chat.completions.create(requestData);
      return completions;
    } catch (error) {
      console.error(`Error generating code: ${error.message}`);
      throw error;
    }
  };
}

module.exports = new Network();
