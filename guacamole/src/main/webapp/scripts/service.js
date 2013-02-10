/*
 *  Guacamole - Clientless Remote Desktop
 *  Copyright (C) 2010  Michael Jumper
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Main Guacamole web service namespace.
 * @namespace
 */
var GuacamoleService = GuacamoleService || {};

/**
 * An arbitrary Guacamole connection, consisting of an ID/protocol pair.
 * 
 * @constructor
 * @param {String} protocol The protocol used by this connection.
 * @param {String} id The ID associated with this connection.
 */
GuacamoleService.Connection = function(protocol, id) {

    /**
     * The protocol associated with this connection.
     */
    this.protocol = protocol;

    /**
     * The ID associated with this connection.
     */
    this.id = id;

};

/**
 * A basic set of permissions that can be assigned to a user, describing
 * whether they can create other users/connections and describing which
 * users/connections they have permission to read or modify.
 */
GuacamoleService.PermissionSet = function() {

    /**
     * Whether permission to create users is granted.
     */
    this.create_user = false;

    /**
     * Whether permission to create connections is granted.
     */
    this.create_connection = false;

    /**
     * Object with a property entry for each readable user.
     */
    this.read_user = {};

    /**
     * Object with a property entry for each updatable user.
     */
    this.update_user = {};

    /**
     * Object with a property entry for each removable user.
     */
    this.remove_user = {};

    /**
     * Object with a property entry for each administerable user.
     */
    this.administer_user = {};

    /**
     * Object with a property entry for each readable connection.
     */
    this.read_connection = {};

    /**
     * Object with a property entry for each updatable connection.
     */
    this.update_connection = {};

    /**
     * Object with a property entry for each removable connection.
     */
    this.remove_connection = {};

    /**
     * Object with a property entry for each administerable connection.
     */
    this.administer_connection = {};

};

/**
 * Collection of service functions which deal with connections. Each function
 * makes an explicit HTTP query to the server, and parses the response.
 */
GuacamoleService.Connections = {

     /**
      * Returns an array of Connections for which the current user has access.
      * 
      * @param {String} parameters Any parameters which should be passed to the
      *                            server for the sake of authentication
      *                            (optional).
      * @return {GuacamoleService.Connection[]} An array of Connections for
      *                                         which the current user has
      *                                         access.
      */   
    "list" : function(parameters) {

        // Construct request URL
        var list_url = "connections";
        if (parameters) list_url += "?" + parameters;

        // Get connection list
        var xhr = new XMLHttpRequest();
        xhr.open("GET", list_url, false);
        xhr.send(null);

        // If fail, throw error
        if (xhr.status != 200)
            throw new Error(xhr.statusText);

        // Otherwise, get list
        var connections = new Array();

        var connectionElements = xhr.responseXML.getElementsByTagName("connection");
        for (var i=0; i<connectionElements.length; i++) {
            connections.push(new GuacamoleService.Connection(
                connectionElements[i].getAttribute("protocol"),
                connectionElements[i].getAttribute("id")
            ));
        }

        return connections;
 
    }

};

/**
 * Collection of service functions which deal with users. Each function
 * makes an explicit HTTP query to the server, and parses the response.
 */
GuacamoleService.Users = {

    /**
     * Returns an array of usernames for which the current user has access.
     * 
     * @param {String} parameters Any parameters which should be passed to the
     *                            server for the sake of authentication
     *                            (optional).
     * @return {String[]} An array of usernames for which the current user has
     *                    access.
     */
    "list" : function(parameters) {

        // Construct request URL
        var users_url = "users";
        if (parameters) users_url += "?" + parameters;

        // Get user list
        var xhr = new XMLHttpRequest();
        xhr.open("GET", users_url, false);
        xhr.send(null);

        // If fail, throw error
        if (xhr.status != 200)
            throw new Error(xhr.statusText);

        // Otherwise, get list
        var users = new Array();

        var userElements = xhr.responseXML.getElementsByTagName("user");
        for (var i=0; i<userElements.length; i++)
            users.push(userElements[i].getAttribute("name"));

        return users;
     
    },

    /**
     * Creates a new user having the given username.
     * 
     * @param {String} username The username of the user to create.
     * @param {String} parameters Any parameters which should be passed to the
     *                            server for the sake of authentication
     *                            (optional).
     */
    "create" : function(username, parameters) {

        // Construct request URL
        var users_url = "users/create?name=" + encodeURIComponent(username);
        if (parameters) users_url += "&" + parameters;

        // Add user
        var xhr = new XMLHttpRequest();
        xhr.open("GET", users_url, false);
        xhr.send(null);

        // If fail, throw error
        if (xhr.status != 200)
            throw new Error(xhr.statusText);

    },

    /**
     * Deletes the user having the given username.
     * 
     * @param {String} username The username of the user to delete.
     * @param {String} parameters Any parameters which should be passed to the
     *                            server for the sake of authentication
     *                            (optional).
     */
    "remove" : function(username, parameters) {

        // Construct request URL
        var users_url = "users/delete?name=" + encodeURIComponent(username);
        if (parameters) users_url += "&" + parameters;

        // Add user
        var xhr = new XMLHttpRequest();
        xhr.open("GET", users_url, false);
        xhr.send(null);

        // If fail, throw error
        if (xhr.status != 200)
            throw new Error(xhr.statusText);

    }

};

/**
 * Collection of service functions which deal with permissions. Each function
 * makes an explicit HTTP query to the server, and parses the response.
 */
GuacamoleService.Permissions = {

     /**
      * Returns a PermissionSet describing the permissions given to a
      * specified user.
      *
      * @param {String} username The username of the user to list permissions
      *                          of. 
      * @param {String} parameters Any parameters which should be passed to the
      *                            server for the sake of authentication
      *                            (optional).
      * @return {GuacamoleService.PermissionSet} A PermissionSet describing the
      *                                          permissions given to the
      *                                          specified user.
      */   
    "list" : function(username, parameters) {

        // Construct request URL
        var list_url = "permissions?user=" + encodeURIComponent(username);
        if (parameters) list_url += "&" + parameters;

        // Get permission list
        var xhr = new XMLHttpRequest();
        xhr.open("GET", list_url, false);
        xhr.send(null);

        // If fail, throw error
        if (xhr.status != 200)
            throw new Error(xhr.statusText);

        // Otherwise, build PermissionSet
        var i, type, name;
        var permissions = new GuacamoleService.PermissionSet();

        // Read connections permissions
        var connectionsElements = xhr.responseXML.getElementsByTagName("connections");
        for (i=0; i<connectionsElements.length; i++) {

            // Get type
            type = connectionsElements[i].getAttribute("type");
            switch (type) {

                // Create permission
                case "create":
                    permissions.create_connection = true;
                    break;

            }

        }

        // Read connection permissions
        var connectionElements = xhr.responseXML.getElementsByTagName("connection");
        for (i=0; i<connectionElements.length; i++) {

            // Get name and type
            type = connectionElements[i].getAttribute("type");
            name = connectionElements[i].getAttribute("name");

            switch (type) {

                // Read permission
                case "read":
                    permissions.read_connection[name] = true;
                    break;

                // Update permission
                case "update":
                    permissions.update_connection[name] = true;
                    break;

                // Admin permission
                case "admin":
                    permissions.administer_connection[name] = true;
                    break;

                // Delete permission
                case "delete":
                    permissions.remove_connection[name] = true;
                    break;

            }

        }

        // Read users permissions
        var usersElements = xhr.responseXML.getElementsByTagName("users");
        for (i=0; i<usersElements.length; i++) {

            // Get type
            type = usersElements[i].getAttribute("type");
            switch (type) {

                // Create permission
                case "create":
                    permissions.create_user = true;
                    break;

            }

        }

        // Read user permissions
        var userElements = xhr.responseXML.getElementsByTagName("user");
        for (i=0; i<userElements.length; i++) {

            // Get name and type
            type = userElements[i].getAttribute("type");
            name = userElements[i].getAttribute("name");

            switch (type) {

                // Read permission
                case "read":
                    permissions.read_user[name] = true;
                    break;

                // Update permission
                case "update":
                    permissions.update_user[name] = true;
                    break;

                // Admin permission
                case "admin":
                    permissions.administer_user[name] = true;
                    break;

                // Delete permission
                case "delete":
                    permissions.remove_user[name] = true;
                    break;

            }

        }

        return permissions;
 
    }

};
