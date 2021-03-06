/* 
 * ElasticBox Confidential
 * Copyright (c) 2014 All Right Reserved, ElasticBox Inc.
 *
 * NOTICE:  All information contained herein is, and remains the property
 * of ElasticBox. The intellectual and technical concepts contained herein are
 * proprietary and may be covered by U.S. and Foreign Patents, patents in process,
 * and are protected by trade secret or copyright law. Dissemination of this
 * information or reproduction of this material is strictly forbidden unless prior
 * written permission is obtained from ElasticBox.
 */

var ElasticBoxUtils = (function() {
    var DescriptorIdPrefix = 'com.elasticbox.jenkins.builders.',
        DeployBoxDescriptorId = DescriptorIdPrefix + 'DeployBox',
        DeployBoxBuildStepName = 'ElasticBox - Deploy Box',

        Dom = YAHOO.util.Dom,
        
        startsWith = function (str, prefix) {
            return str && str.substr(0, prefix.length) === prefix;
        },

        waitUtil = function (condition, method, scope, timeout, elapsedTime) {
            var interval = 100,
                satisfied = condition.call(scope);

            if (satisfied || elapsedTime >= timeout) {
                if (satisfied && method) {
                    method.call(scope);
                }
                return;
            }

            setTimeout(function () {
                waitUtil(condition, method, scope, timeout, elapsedTime - interval);
            }, interval);
        };
        
    return {
        format: function () {
            var args = Array.prototype.slice.call(arguments),
                result = args.shift(),
                i;

            if (result) {
                for (i = 0; i < args.length; i++) {
                    result = result.split('{' + i + '}').join(args[i]);
                }
            }

            return result;
        },
        
        startsWith: startsWith,
        
        waitUtil: function (condition, method, timeout) {
            waitUtil(condition, method, this, timeout, 0);
        },
        
        uuid: function () {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
                return v.toString(16);
            });
        },
        
        getElementByTag: function (tag, root) {
            return Dom.getElementBy(function () { return true; }, tag, root);
        },

        DescriptorIdPrefix: DescriptorIdPrefix,
        DeployBoxDescriptorId: DescriptorIdPrefix + 'DeployBox',
        DeployBoxBuildStepName: DeployBoxBuildStepName,
        ReconfigureBoxDescriptorId: DescriptorIdPrefix + 'ReconfigureBox',
        ManageInstanceDescriptorId: DescriptorIdPrefix + 'ManageInstance',
        ManageBoxDescriptorId: DescriptorIdPrefix + 'ManageBox',
        ElasticBoxCloudDescriptorId: 'com.elasticbox.jenkins.ElasticBoxCloud',
        
        getDescriptorElement: function (childElement) {
            return Dom.getAncestorBy(childElement, function (element) {
                    return ElasticBoxUtils.startsWith(Dom.getAttribute(element, 'descriptorid'), ElasticBoxUtils.DescriptorIdPrefix);
                });
        },
        
        getDeployBoxSteps: function (deployBoxStepElements) {
            if (!deployBoxStepElements) {
                deployBoxStepElements = Dom.getElementsBy(function (element) {
                    return Dom.getAttribute(element, 'descriptorid') === DeployBoxDescriptorId;
                }, 'div', document);
            }

            return _.map(deployBoxStepElements, function (step) {
                return {
                    id: Dom.getAttribute(_.first(Dom.getElementsByClassName('eb-id', 'input', step)), 'value'),
                    name: Dom.getElementBy(function (element) {
                        return startsWith(element.innerHTML, DeployBoxBuildStepName);
                    }, null, step).innerHTML,
                    element: step
                };
            });
        },
        
        getBuildStepId: function (buildStepElement) {
            var idInput = _.first(Dom.getElementsByClassName('eb-id', 'input', buildStepElement));
            return idInput ? idInput.value : null;
        },
        
        setBuildStepId: function (buildStepElement) {
            var idInput = _.first(Dom.getElementsByClassName('eb-id', 'input', buildStepElement));
            if(idInput && !idInput.value) {
                Dom.setAttribute(idInput, 'value', this.format('{0}-{1}', Dom.getAttribute(buildStepElement, 'descriptorid'), this.uuid()));
            }            
        },
        
        initializeBuildSteps: function () {
            Dom.getElementsBy(function (element) {
                var descriptorId = Dom.getAttribute(element, "descriptorid");
                return descriptorId && ElasticBoxUtils.startsWith(descriptorId, ElasticBoxUtils.DescriptorIdPrefix);
            }, 'div', document, function (buildStepElement) {
                ElasticBoxUtils.setBuildStepId(buildStepElement);
            });            
        },
        
        getPriorDeployBoxSteps: function (buildStepElement, cloudName) {
            var buildStepElements = Dom.getElementsBy(function (element) {
                    return startsWith(Dom.getAttribute(element, 'descriptorid'), DescriptorIdPrefix);
                }, 'div', document),
                deployBoxStepElements = [];

            _.some(buildStepElements, function (element) {
                var cloudSelect;
                
                if (element === buildStepElement) {
                    return true;
                }

                if (Dom.getAttribute(element, 'descriptorid') === DeployBoxDescriptorId) {
                    cloudSelect = _.first(Dom.getElementsByClassName('eb-cloud', 'select', element));
                    if (_.isUndefined(cloudName) || (cloudSelect && cloudSelect.value === cloudName)) {
                        deployBoxStepElements.push(element);
                    }
                }

                return false;
            });
            
            return this.getDeployBoxSteps(deployBoxStepElements);
        }
    };
})();
