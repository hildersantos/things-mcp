on run argv
    if (count of argv) < 1 then
        error "Project ID required"
    end if
    
    set projectId to item 1 of argv
    set maxResults to -1
    
    -- Check for optional max results parameter
    if (count of argv) > 1 then
        try
            set maxResults to (item 2 of argv) as integer
        end try
    end if
    
    tell application "Things3"
        set output to ""
        set todoCount to 0
        
        -- Find project by ID
        set targetProject to missing value
        repeat with proj in projects
            if id of proj is equal to projectId then
                set targetProject to proj
                exit repeat
            end if
        end repeat
        
        if targetProject is missing value then
            error "Project not found: " & projectId
        end if
        
        -- Get todos from project
        repeat with toDo in to dos of targetProject
            -- Check max results limit
            if maxResults > 0 and todoCount ≥ maxResults then
                exit repeat
            end if
            
            try
                set todoId to id of toDo
                set todoName to name of toDo
                
                -- Project todos don't have separate area
                set todoArea to ""
                
                -- Get tag names
                set todoTags to ""
                if (count of tags of toDo) > 0 then
                    set tagNames to {}
                    repeat with aTag in tags of toDo
                        set end of tagNames to name of aTag
                    end repeat
                    set AppleScript's text item delimiters to ","
                    set todoTags to tagNames as string
                    set AppleScript's text item delimiters to ""
                end if
                
                -- Build output line
                set output to output & todoId & "|" & todoName & "|" & todoArea & "|" & todoTags & linefeed
                set todoCount to todoCount + 1
                
            on error errMsg
                log "Error processing todo: " & errMsg
            end try
        end repeat
        
        return output
    end tell
end run