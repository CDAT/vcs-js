/* eslint-disable func-names */
import { getTestRequirements } from "../util/TestUtils";

describe("templates", function templateTests() {
  this.timeout(5000);

  it("getsAllTemplateNames", function() {
    const testName = this.test.title;
    const { vcs } = getTestRequirements(testName, false);
    const expectedTemplates = [
      "URof4_dud",
      "boldmid_of3_l",
      "por_topof3_dud",
      "boldtop_of3_l",
      "bold_mid_of3",
      "LRof4_dud",
      "por_midof3",
      "no_legend",
      "ULof4_dud",
      "MR_of6_1legend",
      "ML_of6",
      "por_midof3_dud",
      "mollweide2",
      "hovmuller",
      "URof4",
      "BLof6",
      "bot_of2",
      "LLof4_dud",
      "LRof4",
      "ASD_dud",
      "bold_top_of3",
      "ASD",
      "UL_of6_1legend",
      "ULof4",
      "ULof6",
      "polar",
      "BL_of6_1legend",
      "ML_of6_1legend",
      "top_of2",
      "LLof4",
      "deftaylor",
      "UR_of6",
      "por_botof3",
      "default",
      "BR_of6_1legend",
      "por_botof3_dud",
      "BRof6",
      "por_topof3",
      "MR_of6",
      "UR_of6_1legend",
      "boldbot_of3_l",
      "quick"
    ];

    return vcs.getalltemplatenames().then(names => {
      return new Promise((resolve, reject) => {
        for (let item of expectedTemplates) {
          if(names.indexOf(item) === -1){
            reject(new Error(`Expected list of template names to contain '${item}'`));
          } 
        }
        resolve(true)
      });
    });
  });

  it("getsATemplate", function() {
    const testName = this.test.title;
    const { vcs } = getTestRequirements(testName, false);

    return vcs.gettemplate("default").then(data => {
      return new Promise((resolve, reject) => {
        if(data && data.name === "default"){
          resolve(true)
        }
        reject(new Error('gettemplate did not return the default template'));
      });
    });
  });

  it("getsATemplateReturnsNull", function() {
    const testName = this.test.title;
    const { vcs } = getTestRequirements(testName, false);

    return vcs.gettemplate("doesNotExist").then(data => {
      return new Promise((resolve, reject) => {
        if(data === null){
          resolve(true)
        }
        reject(new Error('gettemplate should return null if a requested template does not exist'));
      });
    });
  });

  it("settemplate", function() {
    const testName = this.test.title;
    const { vcs } = getTestRequirements(testName, false);
    const newValues = {'ymintic1': {'member': 'ymintic1', 'priority': 0, 'line': 'default'}} // change priority from 1 to 0
    return vcs.settemplate("ASD", newValues).then(() => {
      return vcs.gettemplate("ASD").then(data => {
        return new Promise((resolve, reject) => {
          if(data && data.name === "ASD" && data.ymintic1.priority === 0){
            resolve(true)
          }
          reject(new Error('settemplate failed to set ymintic1 priority to 0'));
        });
      });
    });
  });

  it("createsATemplate", function() {
    const testName = this.test.title;
    const { vcs } = getTestRequirements(testName, false);
    const baseTemplateName = "default"
    const newTemplateName = "testTemplate"
    return vcs.createtemplate(newTemplateName, baseTemplateName).then(() => {
      return vcs.gettemplate(newTemplateName).then(data => {
        return new Promise((resolve, reject) => {
          if(data && data.name === "testTemplate"){
            resolve(true)
          }
          reject(new Error('createtemplate did not create a template with the given name'));
        });
      });
    });
  });
  
  it("removesATemplate", function() {
    const testName = this.test.title;
    const { vcs } = getTestRequirements(testName, false);
    const templateNameToRemove = "testTemplate"
    return vcs.removetemplate(templateNameToRemove).then(() => {
      return vcs.gettemplate(templateNameToRemove).then(data => {
        return new Promise((resolve, reject) => {
          if(data === null){
            resolve(true)
          }
          reject(new Error('Got back a template that should have been removed.'));
        });
      });
    });
  });
});