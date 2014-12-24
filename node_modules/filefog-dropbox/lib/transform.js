var transform = {};

transform.accountInfo = function(account_response){

    var transform = {};
    transform.name = account_response.name;
    transform.email = account_response.email;
    transform.avatar_url = '';
    transform.created_date = null;
    transform.modified_date = null;
    transform.id = account_response.uid;
    transform._raw = account_response;
    return transform;
};

transform.checkQuota = function (quota_response){
    var transform = {};
    transform.total_bytes = quota_response.quota; //total space allocated in bytes
    transform.used_bytes = quota_response.usedQuota; //bytes used.
    transform.limits= {
    }
    transform._raw = quota_response;
    return transform;
};

transform.deleteFile = function(deletion_response){
    var transform = {};
    transform.success = true;
    transform._raw = deletion_response;
    return transform;
};

transform.downloadFile = function(download_response){
    var transform = {};
    //TODO: figure out what the download file response should be.
    transform.data = download_response.data;
    transform.headers = {};
    transform._raw = download_response;
    return transform;
};

transform.getFileInformation = function (file_response){
    var transform = {};
    transform.is_file = file_response.isFile;
    transform.is_folder = file_response.isFolder;
    transform.etag = file_response.versionTag;
    transform.identifier = file_response.path;
    var path_parts = file_response.path.split('/')
    path_parts.pop();
    var parent_path = path_parts.join('/');
    transform.parent_identifier = parent_path.toLowerCase();
    transform.mimetype = file_response.mime_type
    transform.created_date = new Date(file_response.modifiedAt);
    transform.modified_date = new Date(file_response.modifiedAt);
    transform.name = file_response.name;
    transform.description = '';
    //transform.extension = file_response.name.split('.')
    transform.checksum = file_response.contentHash;
    transform.file_size = file_response.size;
    transform._raw = file_response;
    return transform;
};

transform.deleteFolder = function(deletion_response){
    var transform = {};
    transform.success = true;
    transform._raw = deletion_response;
    return transform;
};


transform.getFolderInformation = function(folder_response){
    var transform = {};
    transform.is_file = folder_response.isFile;
    transform.is_folder = folder_response.isFolder;
    transform.etag = folder_response.versionTag;
    transform.identifier = folder_response.path.toLowerCase();
    var path_parts = folder_response.path.split('/')
    path_parts.pop();
    var parent_path = path_parts.join('/').toLowerCase();
    transform.parent_identifier = parent_path;
    transform.created_date = new Date(folder_response.modifiedAt);
    transform.modified_date = new Date(folder_response.modifiedAt);
    transform.name = folder_response.name;
    transform.description = '';
    transform._raw = folder_response;
    return transform;
};


transform.retrieveFolderItems = function(items_response){
    var self = this;
    var transform = {};
    transform.total_items = null;
    transform.content = items_response.content_stat_array.map(function(current_item){
        if(current_item.isFile){
            return self.getFileInformation(current_item);
        }
        else{
            return self.getFolderInformation(current_item);
        }
    });
    return transform;
};

///////////////////////////////////////////////////////////////////////////////
// Event transforms

transform.eventUpsert = function(event){
    var self = this;
    var item ={};
    if(event.stat.isFile){
        item = self.getFileInformation(event.stat);
    }
    else{
        item= self.getFolderInformation(event.stat);
    }
    item.event_type = "upsert";
    return item;
}

transform.eventDelete = function(event){
    return {
        event_type: "delete",
        identifier: event.path.toLowerCase()
    }
}

transform.events = function(events_response){
    var self = this;
    var transform = {};
    transform.next_cursor = events_response.cursorTag;
    transform.events = events_response.changes.map(function(event){
        if(event.stat){
            return self.eventUpsert(event);
        }
        else{
            return self.eventDelete(event);
        }
    })
    transform._raw = events_response;
    return transform;
}

///////////////////////////////////////////////////////////////////////////////
// Aliases
transform.createFile = transform.getFileInformation;
transform.createFolder = transform.getFolderInformation;
transform.updateFile = transform.getFileInformation;
transform.updateFileInformation = transform.getFileInformation;

///////////////////////////////////////////////////////////////////////////////
// OAuth transforms

transform.oAuthGetAccessToken = function(token_response){
    var transform = {};
    transform.access_token = token_response.access_token;
    transform.refresh_token = token_response.refresh_token;
    transform.expires_on = null;
    transform._raw = token_response;
    return transform;
}

transform.oAuthRefreshAccessToken = function(token_response){
    var transform = {};
    transform.access_token = token_response.access_token;
    transform.refresh_token = token_response.refresh_token;
    transform.expires_on = null;
    transform._raw = token_response;
    return transform;
}


module.exports = transform;
