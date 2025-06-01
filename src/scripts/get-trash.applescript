on run argv
    -- Optional max results parameter
    set maxResults to -1
    if (count of argv) > 0 then
        try
            set maxResults to (item 1 of argv) as integer
        end try
    end if
    
    tell application "Things3"
        set output to ""
        set todoCount to 0
        
        repeat with toDo in to dos of list "Trash"
            -- Check max results limit
            if maxResults > 0 and todoCount ≥ maxResults then
                exit repeat
            end if
            
            try
                set todoId to id of toDo
                set todoName to name of toDo
                
                -- Get area name if exists
                set todoArea to ""
                if area of toDo is not missing value then
                    set todoArea to name of area of toDo
                end if
                
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
                set todoCount to todoCount + 1
                
            on error errMsg
                -- Log error but continue processing
                log "Error processing todo: " & errMsg
            end try
        end repeat
        
        return output
    end tell
end run