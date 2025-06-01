on run argv
    if (count of argv) < 1 then
        error "Area ID required"
    end if
    
    set areaId to item 1 of argv
    set maxResults to -1
    
    -- Check for optional max results parameter
    if (count of argv) > 1 then
        try
            set maxResults to (item 2 of argv) as integer
        end try
    end if
    
    tell application "Things3"
        set output to ""
        set itemCount to 0
        
        -- Find area by ID
        set targetArea to missing value
        repeat with a in areas
            if id of a is equal to areaId then
                set targetArea to a
                exit repeat
            end if
        end repeat
        
        if targetArea is missing value then
            error "Area not found: " & areaId
        end if
        
        -- Get todos in area
        repeat with toDo in to dos
            -- Check if todo belongs to this area
            if area of toDo is not missing value and id of area of toDo is equal to areaId then
                -- Check max results limit
                if maxResults > 0 and itemCount ≥ maxResults then
                    exit repeat
                end if
                
                try
                    set todoId to id of toDo
                    set todoName to name of toDo
                    
                    -- Area is already known
                    set todoArea to ""
                    
                    -- Get tag names
                    set todoTags to ""
                    try
                        set todoTags to tag names of toDo
                        if todoTags is missing value then set todoTags to ""
                    on error
                        set todoTags to ""
                    end try
                    
                    -- Build output line
                    set output to output & todoId & "|" & todoName & "|" & todoArea & "|" & todoTags & linefeed
                    set itemCount to itemCount + 1
                    
                on error errMsg
                    log "Error processing todo: " & errMsg
                end try
            end if
        end repeat
        
        -- Also get projects in area
        repeat with proj in projects
            if area of proj is not missing value and id of area of proj is equal to areaId then
                -- Check max results limit
                if maxResults > 0 and itemCount ≥ maxResults then
                    exit repeat
                end if
                
                try
                    -- Only include open projects
                    if status of proj is open then
                        set projId to id of proj
                        set projName to name of proj
                        
                        -- Area is already known
                        set projArea to ""
                        
                        -- Get tag names
                        set projTags to ""
                        try
                            set projTags to tag names of proj
                            if projTags is missing value then set projTags to ""
                        on error
                            set projTags to ""
                        end try
                        
                        -- Build output line
                        set output to output & projId & "|" & projName & "|" & projArea & "|" & projTags & linefeed
                        set itemCount to itemCount + 1
                    end if
                    
                on error errMsg
                    log "Error processing project: " & errMsg
                end try
            end if
        end repeat
        
        return output
    end tell
end run